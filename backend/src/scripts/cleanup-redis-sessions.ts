import "../bootstrap";
import { cleanOrphanSessions } from "../helpers/cleanOrphanSessions";
import logger from "../utils/logger";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

async function run() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🧹 LIMPEZA DE SESSÕES ÓRFÃS DO REDIS');
    console.log('='.repeat(80) + '\n');
    
    const companyIdStr = await question('Digite o ID da empresa (ou ENTER para TODAS): ');
    const companyId = companyIdStr.trim() ? parseInt(companyIdStr) : undefined;
    
    if (companyIdStr && (!companyId || isNaN(companyId))) {
      console.log('❌ ID de empresa inválido!');
      rl.close();
      return;
    }
    
    console.log('\n⚠️  Esta operação vai:');
    console.log('   ✅ PRESERVAR sessões de WhatsApps CONECTADOS');
    console.log('   🗑️  REMOVER sessões de WhatsApps DESCONECTADOS');
    console.log('   🗑️  REMOVER sessões ÓRFÃS (IDs que não existem mais)\n');
    
    const confirm = await question('Confirma? (Y/N): ');
    
    if (confirm.toUpperCase() !== 'Y') {
      console.log('❌ Cancelado!\n');
      rl.close();
      return;
    }
    
    console.log('');
    await cleanOrphanSessions(companyId);
    
    console.log('\n✅ Limpeza concluída com sucesso!\n');
    rl.close();
    
  } catch (error) {
    console.error(`\n❌ Erro: ${error.message}\n`);
    logger.error(`Erro no script de limpeza: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

run().then(() => process.exit(0));


