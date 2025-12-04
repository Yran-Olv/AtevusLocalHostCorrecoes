# Script para configurar permissões de leitura e gravação na pasta de mídias
# Execute como Administrador no PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configurando Permissões de Mídia" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obter o caminho absoluto da pasta public
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$publicFolder = Join-Path $backendPath "public"

Write-Host "Pasta de mídias: $publicFolder" -ForegroundColor Yellow
Write-Host ""

# Verificar se a pasta existe
if (-Not (Test-Path $publicFolder)) {
    Write-Host "Criando pasta public..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $publicFolder -Force | Out-Null
    Write-Host "✓ Pasta criada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "✓ Pasta public já existe" -ForegroundColor Green
}

# Função para configurar permissões
function Set-FolderPermissions {
    param (
        [string]$FolderPath,
        [string]$Account = "Todos"  # "Todos" para Windows em português, "Everyone" para inglês
    )
    
    try {
        # Obter ACL atual
        $acl = Get-Acl $FolderPath
        
        # Criar regra de permissão para leitura e gravação
        # Tenta primeiro com "Todos" (português), depois com "Everyone" (inglês)
        $accounts = @("Todos", "Everyone")
        $success = $false
        
        foreach ($acc in $accounts) {
            try {
                $permission = $acc, "Read,Write,Modify,DeleteSubdirectoriesAndFiles", "ContainerInherit,ObjectInherit", "None", "Allow"
                $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
                $acl.SetAccessRule($accessRule)
                Set-Acl -Path $FolderPath -AclObject $acl
                Write-Host "  ✓ Permissões configuradas para: $FolderPath (usando: $acc)" -ForegroundColor Green
                $success = $true
                break
            }
            catch {
                # Tenta próximo account
                continue
            }
        }
        
        if (-not $success) {
            throw "Não foi possível configurar permissões com nenhum account"
        }
        
        return $true
    }
    catch {
        Write-Host "  ✗ Erro ao configurar permissões para: $FolderPath" -ForegroundColor Red
        Write-Host "    Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Configurar permissões na pasta principal
Write-Host "Configurando permissões na pasta principal..." -ForegroundColor Yellow
Set-FolderPermissions -FolderPath $publicFolder

# Configurar permissões em subpastas existentes
Write-Host ""
Write-Host "Configurando permissões em subpastas..." -ForegroundColor Yellow

$subfolders = Get-ChildItem -Path $publicFolder -Directory -ErrorAction SilentlyContinue
if ($subfolders) {
    foreach ($folder in $subfolders) {
        Set-FolderPermissions -FolderPath $folder.FullName
        
        # Configurar permissões em subpastas aninhadas
        $nestedFolders = Get-ChildItem -Path $folder.FullName -Directory -Recurse -ErrorAction SilentlyContinue
        foreach ($nestedFolder in $nestedFolders) {
            Set-FolderPermissions -FolderPath $nestedFolder.FullName
        }
    }
} else {
    Write-Host "  Nenhuma subpasta encontrada (isso é normal se for a primeira execução)" -ForegroundColor Gray
}

# Configurar permissões em arquivos existentes
Write-Host ""
Write-Host "Configurando permissões em arquivos..." -ForegroundColor Yellow

$files = Get-ChildItem -Path $publicFolder -File -Recurse -ErrorAction SilentlyContinue
if ($files) {
    $fileCount = 0
    foreach ($file in $files) {
        try {
            $acl = Get-Acl $file.FullName
            # Tenta primeiro com "Todos" (português), depois com "Everyone" (inglês)
            $accounts = @("Todos", "Everyone")
            $fileSuccess = $false
            foreach ($acc in $accounts) {
                try {
                    $permission = $acc, "Read,Write,Modify", "None", "None", "Allow"
                    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
                    $acl.SetAccessRule($accessRule)
                    Set-Acl -Path $file.FullName -AclObject $acl
                    $fileSuccess = $true
                    break
                }
                catch {
                    # Tenta próximo account
                    continue
                }
            }
            if ($fileSuccess) {
                $fileCount++
            }
        }
        catch {
            # Ignorar erros em arquivos individuais
        }
    }
    Write-Host "  ✓ Permissões configuradas em $fileCount arquivo(s)" -ForegroundColor Green
} else {
    Write-Host "  Nenhum arquivo encontrado (isso é normal se for a primeira execução)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuração Concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "- Execute este script como Administrador para garantir todas as permissões" -ForegroundColor Yellow
Write-Host "- Se ainda houver problemas, verifique as permissões manualmente no Windows Explorer" -ForegroundColor Yellow
Write-Host "- Clique com botão direito na pasta > Propriedades > Segurança > Editar" -ForegroundColor Yellow
Write-Host ""

# Pausar para o usuário ver a mensagem
Read-Host "Pressione Enter para sair"

