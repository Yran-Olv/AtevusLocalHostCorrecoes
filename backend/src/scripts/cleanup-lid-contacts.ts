import "../bootstrap";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Message from "../models/Message";
import ContactCustomField from "../models/ContactCustomField";
import { Op } from "sequelize";
import logger from "../utils/logger";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

interface ContactAnalysis {
  contact: Contact;
  hasJidDuplicate: boolean;
  jidDuplicate?: Contact;
  ticketsCount: number;
  messagesCount: number;
  lastActivity: Date | null;
  inactiveDays: number;
}

async function analyzeInactiveContacts(
  companyId: number, 
  inactiveMonths: number
): Promise<ContactAnalysis[]> {
  
  const inactiveDate = new Date();
  inactiveDate.setMonth(inactiveDate.getMonth() - inactiveMonths);
  
  console.log(`\n🔍 Buscando contatos LID inativos (empresa ${companyId}, >${inactiveMonths} meses)...\n`);
  
  const lidContacts = await Contact.findAll({
    where: {
      companyId,
      [Op.or]: [
        { lid: { [Op.like]: '%@lid' } },
        { 
          number: { [Op.notLike]: '55%' },
          [Op.and]: [
            { number: { [Op.ne]: '' } }
          ]
        }
      ],
      updatedAt: { [Op.lt]: inactiveDate }
    },
    order: [['updatedAt', 'ASC']]
  });
  
  console.log(`📊 Total de contatos LID inativos: ${lidContacts.length}\n`);
  
  const analysis: ContactAnalysis[] = [];
  
  for (const contact of lidContacts) {
    const ticketsCount = await Ticket.count({ where: { contactId: contact.id } });
    const messagesCount = await Message.count({ where: { contactId: contact.id } });
    
    const lastMessage = await Message.findOne({
      where: { contactId: contact.id },
      order: [['createdAt', 'DESC']]
    });
    
    const lastActivity = lastMessage?.createdAt || contact.updatedAt;
    const inactiveDays = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    
    const baseNumber = contact.number.replace(/\D/g, '').substring(0, 11);
    const jidDuplicate = await Contact.findOne({
      where: {
        companyId,
        id: { [Op.ne]: contact.id },
        number: { [Op.like]: `55%${baseNumber.substring(2)}%` }
      }
    });
    
    analysis.push({
      contact,
      hasJidDuplicate: !!jidDuplicate,
      jidDuplicate,
      ticketsCount,
      messagesCount,
      lastActivity,
      inactiveDays
    });
  }
  
  return analysis;
}

async function runCleanup() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🧹 LIMPEZA DE CONTATOS LID INATIVOS');
    console.log('='.repeat(80) + '\n');
    
    const companyIdStr = await question('Digite o ID da empresa: ');
    const companyId = parseInt(companyIdStr);
    
    if (!companyId || isNaN(companyId)) {
      console.log('❌ ID de empresa inválido!');
      rl.close();
      return;
    }
    
    const monthsStr = await question('Buscar contatos inativos há quantos meses? (ex: 6): ');
    const months = parseInt(monthsStr);
    
    if (!months || isNaN(months) || months < 1) {
      console.log('❌ Número de meses inválido!');
      rl.close();
      return;
    }
    
    const analysis = await analyzeInactiveContacts(companyId, months);
    
    if (analysis.length === 0) {
      console.log('✅ Nenhum contato LID inativo encontrado!\n');
      rl.close();
      return;
    }
    
    const withDuplicates = analysis.filter(a => a.hasJidDuplicate);
    const withoutDuplicates = analysis.filter(a => !a.hasJidDuplicate);
    const withData = withoutDuplicates.filter(a => a.ticketsCount > 0 || a.messagesCount > 0);
    const empty = withoutDuplicates.filter(a => a.ticketsCount === 0 && a.messagesCount === 0);
    
    console.log('📊 ANÁLISE:');
    console.log(`   ${withDuplicates.length} têm duplicata JID → UNIFICAR ou DELETAR`);
    console.log(`   ${withData.length} sem duplicata, COM dados → MANTER ou DELETAR EM CASCATA`);
    console.log(`   ${empty.length} sem duplicata, VAZIOS → DELETAR\n`);
    
    let totalDeleted = 0;
    let totalUnified = 0;
    let totalCascadeDeleted = 0;
    
    if (withDuplicates.length > 0) {
      console.log(`\n━━━ CONTATOS DUPLICADOS (${withDuplicates.length}) ━━━\n`);
      console.log('Opções:');
      console.log('  U = UNIFICAR (move histórico para JID, deleta LID)');
      console.log('  D = DELETAR EM CASCATA (remove contato + tickets + mensagens)');
      console.log('  N = NÃO FAZER NADA\n');
      
      const duplicateAction = await question(`Escolha (U/D/N): `);
      
      if (duplicateAction.toUpperCase() === 'U') {
        console.log('\n🔄 Unificando duplicatas...\n');
        
        for (const item of withDuplicates) {
          try {
            console.log(`📦 ${item.contact.id} (${item.contact.name}) → ${item.jidDuplicate.id}`);
            console.log(`   Tickets: ${item.ticketsCount}, Mensagens: ${item.messagesCount}`);
            
            await Ticket.update({ contactId: item.jidDuplicate.id }, { where: { contactId: item.contact.id } });
            await Message.update({ contactId: item.jidDuplicate.id }, { where: { contactId: item.contact.id } });
            await ContactCustomField.update({ contactId: item.jidDuplicate.id }, { where: { contactId: item.contact.id } });
            
            if (!item.jidDuplicate.lid) {
              await item.jidDuplicate.update({ lid: item.contact.lid || `${item.contact.number}@lid` });
            }
            
            await item.contact.destroy();
            
            console.log(`   ✅ Unificado!\n`);
            totalUnified++;
          } catch (error) {
            console.log(`   ❌ Erro: ${error.message}\n`);
          }
        }
        
        console.log(`✅ ${totalUnified}/${withDuplicates.length} unificados!\n`);
        
      } else if (duplicateAction.toUpperCase() === 'D') {
        console.log('\n⚠️  ATENÇÃO: Isto vai DELETAR contatos + tickets + mensagens!');
        const confirm = await question('Tem certeza? Digite "CONFIRMO" para continuar: ');
        
        if (confirm === 'CONFIRMO') {
          console.log('\n🗑️  Deletando contatos duplicados EM CASCATA...\n');
          
          for (const item of withDuplicates) {
            try {
              console.log(`🗑️  ${item.contact.id} (${item.contact.name})`);
              console.log(`   Deletando: ${item.ticketsCount} tickets, ${item.messagesCount} mensagens`);
              
              await Message.destroy({ where: { contactId: item.contact.id } });
              await Ticket.destroy({ where: { contactId: item.contact.id } });
              await ContactCustomField.destroy({ where: { contactId: item.contact.id } });
              await item.contact.destroy();
              
              console.log(`   ✅ Deletado em cascata!\n`);
              totalCascadeDeleted++;
            } catch (error) {
              console.log(`   ❌ Erro: ${error.message}\n`);
            }
          }
          
          console.log(`✅ ${totalCascadeDeleted}/${withDuplicates.length} deletados!\n`);
        } else {
          console.log('❌ Cancelado!\n');
        }
      }
    }
    
    if (empty.length > 0) {
      const deleteAnswer = await question(`\n🗑️  Deseja DELETAR os ${empty.length} contatos vazios (sem tickets/mensagens)? (Y/N): `);
      
      if (deleteAnswer.toUpperCase() === 'Y') {
        console.log('\n🗑️  Deletando contatos vazios...\n');
        
        for (const item of empty) {
          try {
            console.log(`🗑️  Deletando ${item.contact.id} (${item.contact.name}) - inativo há ${item.inactiveDays} dias`);
            await item.contact.destroy();
            console.log(`   ✅ Deletado!\n`);
            totalDeleted++;
          } catch (error) {
            console.log(`   ❌ Erro: ${error.message}\n`);
          }
        }
        
        console.log(`✅ ${totalDeleted}/${empty.length} contatos deletados!\n`);
      }
    }
    
    if (withData.length > 0) {
      console.log(`\n━━━ CONTATOS COM DADOS (${withData.length}) ━━━\n`);
      console.log('Estes contatos têm tickets/mensagens mas não têm duplicata JID.');
      console.log('\nOpções:');
      console.log('  M = MANTER (preservar histórico, atualizar quando cliente responder)');
      console.log('  D = DELETAR EM CASCATA (remove contato + tickets + mensagens)');
      console.log('  V = VER DETALHES antes de decidir\n');
      
      const dataAction = await question(`Escolha (M/D/V): `);
      
      if (dataAction.toUpperCase() === 'V') {
        console.log('\n📋 Detalhes dos contatos:\n');
        withData.forEach((item, idx) => {
          console.log(`${idx + 1}. ID ${item.contact.id} - ${item.contact.name}`);
          console.log(`   Número: ${item.contact.number}`);
          console.log(`   Tickets: ${item.ticketsCount}, Mensagens: ${item.messagesCount}`);
          console.log(`   Inativo há: ${item.inactiveDays} dias\n`);
        });
        
        const afterView = await question(`\nAgora, deseja DELETAR (D) ou MANTER (M)? `);
        
        if (afterView.toUpperCase() === 'D') {
          console.log(`\n⚠️  ATENÇÃO: Isto vai DELETAR ${withData.length} contatos + TODOS os tickets/mensagens!`);
          const confirm = await question('Tem CERTEZA? Digite "CONFIRMO DELETAR TUDO": ');
          
          if (confirm === 'CONFIRMO DELETAR TUDO') {
            console.log('\n🗑️  Deletando contatos COM dados EM CASCATA...\n');
            
            for (const item of withData) {
              try {
                console.log(`🗑️  ${item.contact.id} (${item.contact.name})`);
                console.log(`   Deletando: ${item.ticketsCount} tickets, ${item.messagesCount} mensagens`);
                
                await Message.destroy({ where: { contactId: item.contact.id } });
                await Ticket.destroy({ where: { contactId: item.contact.id } });
                await ContactCustomField.destroy({ where: { contactId: item.contact.id } });
                await item.contact.destroy();
                
                console.log(`   ✅ Deletado!\n`);
                totalCascadeDeleted++;
              } catch (error) {
                console.log(`   ❌ Erro: ${error.message}\n`);
              }
            }
            
            console.log(`✅ ${totalCascadeDeleted}/${withData.length} deletados!\n`);
          } else {
            console.log('❌ Cancelado, contatos mantidos!\n');
          }
        } else {
          console.log('✅ Contatos mantidos!\n');
        }
        
      } else if (dataAction.toUpperCase() === 'D') {
        console.log(`\n⚠️  ATENÇÃO: Isto vai DELETAR ${withData.length} contatos + TODOS os tickets/mensagens!`);
        const confirm = await question('Tem CERTEZA? Digite "CONFIRMO DELETAR TUDO": ');
        
        if (confirm === 'CONFIRMO DELETAR TUDO') {
          console.log('\n🗑️  Deletando contatos COM dados EM CASCATA...\n');
          
          for (const item of withData) {
            try {
              console.log(`🗑️  ${item.contact.id} (${item.contact.name})`);
              console.log(`   Deletando: ${item.ticketsCount} tickets, ${item.messagesCount} mensagens`);
              
              await Message.destroy({ where: { contactId: item.contact.id } });
              await Ticket.destroy({ where: { contactId: item.contact.id } });
              await ContactCustomField.destroy({ where: { contactId: item.contact.id } });
              await item.contact.destroy();
              
              console.log(`   ✅ Deletado!\n`);
              totalCascadeDeleted++;
            } catch (error) {
              console.log(`   ❌ Erro: ${error.message}\n`);
            }
          }
          
          console.log(`✅ ${totalCascadeDeleted}/${withData.length} deletados!\n`);
        } else {
          console.log('❌ Cancelado, contatos mantidos!\n');
        }
      } else {
        console.log('✅ Contatos mantidos!\n');
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ LIMPEZA CONCLUÍDA');
    console.log('='.repeat(80));
    console.log(`Contatos unificados: ${totalUnified}`);
    console.log(`Contatos deletados (vazios): ${totalDeleted}`);
    console.log(`Contatos deletados em cascata (com dados): ${totalCascadeDeleted}`);
    console.log(`Total removido do banco: ${totalDeleted + totalCascadeDeleted + totalUnified}`);
    console.log('='.repeat(80) + '\n');
    
    rl.close();
    
  } catch (error) {
    console.error(`\n❌ Erro: ${error.message}`);
    logger.error(`Erro no cleanup de LID: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

runCleanup().then(() => process.exit(0));

