# test-api.ps1
# Roda a bateria completa de testes da API FordRetain e gera evidencias
# (arquivo .txt com todas as requisicoes/respostas + resumo PASS/FAIL)
# para anexar na documentacao da Sprint 3.

$baseUrl = "http://localhost:8080/api/v1"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$evidDir = Join-Path $PSScriptRoot "evidencias\$timestamp"
New-Item -ItemType Directory -Path $evidDir -Force | Out-Null

$logFile = Join-Path $evidDir "evidencias.txt"
$results = @()

function Write-Log {
    param([string]$Text)
    $Text | Out-File -FilePath $logFile -Append -Encoding utf8
}

function Invoke-Test {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus
    )

    Write-Host "Testando: $Name..." -ForegroundColor Cyan

    $params = @{
        Uri             = $Url
        Method          = $Method
        Headers         = $Headers
        UseBasicParsing = $true
    }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = "application/json"
    }

    try {
        $response = Invoke-WebRequest @params
        $status = [int]$response.StatusCode
        $content = $response.Content
    } catch {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $content = $reader.ReadToEnd()
            } catch {
                $content = "(sem corpo de resposta)"
            }
        } else {
            $status = 0
            $content = "ERRO DE CONEXAO: $($_.Exception.Message)"
        }
    }

    $pass = ($status -eq $ExpectedStatus)
    $verdict = if ($pass) { "PASS" } else { "FAIL" }

    Write-Log "===================================================================="
    Write-Log "TESTE: $Name"
    Write-Log "$Method $Url"
    if ($Body) { Write-Log "Body: $Body" }
    Write-Log "Esperado: $ExpectedStatus | Obtido: $status | Resultado: $verdict"
    Write-Log "Resposta: $content"
    Write-Log ""

    $script:results += [PSCustomObject]@{
        Teste     = $Name
        Esperado  = $ExpectedStatus
        Obtido    = $status
        Resultado = $verdict
    }

    return $content
}

Write-Log "EVIDENCIAS DE TESTE - FordRetain API"
Write-Log "Gerado em: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
Write-Log ""

# ---------- 1. LOGIN ----------
$loginAdminBody = '{"email":"admin@ford.com","senha":"ford2026"}'
$loginGerenteBody = '{"email":"gerente@ford.com","senha":"ford2026"}'
$loginAnalistaBody = '{"email":"analista@ford.com","senha":"ford2026"}'

$respAdmin = Invoke-Test -Name "Login ADMIN" -Method POST -Url "$baseUrl/auth/login" -Body $loginAdminBody -ExpectedStatus 200
$respGerente = Invoke-Test -Name "Login GERENTE" -Method POST -Url "$baseUrl/auth/login" -Body $loginGerenteBody -ExpectedStatus 200
$respAnalista = Invoke-Test -Name "Login ANALISTA" -Method POST -Url "$baseUrl/auth/login" -Body $loginAnalistaBody -ExpectedStatus 200

$tokenAdmin = ($respAdmin | ConvertFrom-Json).token
$tokenGerente = ($respGerente | ConvertFrom-Json).token
$tokenAnalista = ($respAnalista | ConvertFrom-Json).token

$hAdmin = @{ Authorization = "Bearer $tokenAdmin" }
$hGerente = @{ Authorization = "Bearer $tokenGerente" }
$hAnalista = @{ Authorization = "Bearer $tokenAnalista" }

# ---------- 2. AUTENTICACAO / AUTORIZACAO ----------
Invoke-Test -Name "GET /dashboard sem token" -Method GET -Url "$baseUrl/dashboard" -ExpectedStatus 401 | Out-Null
Invoke-Test -Name "GET /dashboard token invalido" -Method GET -Url "$baseUrl/dashboard" -Headers @{ Authorization = "Bearer token.invalido.aqui" } -ExpectedStatus 401 | Out-Null

$predictBodyValido = @"
{
  "nome": "Carlos Pereira Teste",
  "email": "carlos.evidencia.$timestamp@email.com",
  "telefone": "11988887777",
  "regiao": "SP",
  "idade": 29,
  "canalCompra": "ONLINE",
  "formaPagamento": "FINANCIAMENTO",
  "modeloVeiculo": "RANGER",
  "dataCompra": "2025-11-20",
  "historicoMarca": "PRIMEIRA_COMPRA"
}
"@

Invoke-Test -Name "POST /predict como ANALISTA (sem permissao)" -Method POST -Url "$baseUrl/predict" -Headers $hAnalista -Body $predictBodyValido -ExpectedStatus 403 | Out-Null

# ---------- 3. POST /predict ----------
$predictResp = Invoke-Test -Name "POST /predict valido (GERENTE)" -Method POST -Url "$baseUrl/predict" -Headers $hGerente -Body $predictBodyValido -ExpectedStatus 201
$clienteId = ($predictResp | ConvertFrom-Json).clienteId
Write-Log ">>> clienteId criado para os proximos testes: $clienteId"
Write-Log ""

$predictBodyInvalido = @"
{
  "nome": "Teste Invalido",
  "email": "email-sem-arroba",
  "regiao": "SP",
  "idade": 15,
  "canalCompra": "ONLINE",
  "formaPagamento": "FINANCIAMENTO",
  "modeloVeiculo": "RANGER",
  "dataCompra": "2025-11-20",
  "historicoMarca": "PRIMEIRA_COMPRA"
}
"@
Invoke-Test -Name "POST /predict payload invalido (400)" -Method POST -Url "$baseUrl/predict" -Headers $hGerente -Body $predictBodyInvalido -ExpectedStatus 400 | Out-Null
Invoke-Test -Name "POST /predict email duplicado (409)" -Method POST -Url "$baseUrl/predict" -Headers $hGerente -Body $predictBodyValido -ExpectedStatus 409 | Out-Null

# ---------- 4. GET /clientes/{id} ----------
Invoke-Test -Name "GET /clientes/{id} existente (ANALISTA)" -Method GET -Url "$baseUrl/clientes/$clienteId" -Headers $hAnalista -ExpectedStatus 200 | Out-Null
Invoke-Test -Name "GET /clientes/{id} inexistente (404)" -Method GET -Url "$baseUrl/clientes/999999" -Headers $hGerente -ExpectedStatus 404 | Out-Null
Invoke-Test -Name "GET /clientes/{id} sem token (401)" -Method GET -Url "$baseUrl/clientes/$clienteId" -ExpectedStatus 401 | Out-Null

# ---------- 5. PUT /clientes/{id} ----------
$updateBody = @"
{
  "nome": "Carlos Pereira Junior",
  "telefone": "11977776666",
  "regiao": "RJ",
  "idade": 30,
  "canalCompra": "CONCESSIONARIA",
  "formaPagamento": "VISTA",
  "modeloVeiculo": "TERRITORY",
  "dataCompra": "2025-11-20",
  "historicoMarca": "RECOMPRA"
}
"@
Invoke-Test -Name "PUT /clientes/{id} valido (GERENTE)" -Method PUT -Url "$baseUrl/clientes/$clienteId" -Headers $hGerente -Body $updateBody -ExpectedStatus 200 | Out-Null
Invoke-Test -Name "PUT /clientes/{id} como ANALISTA (403)" -Method PUT -Url "$baseUrl/clientes/$clienteId" -Headers $hAnalista -Body $updateBody -ExpectedStatus 403 | Out-Null

$updateBodyInvalido = @"
{
  "nome": "Teste",
  "regiao": "SP",
  "idade": 10,
  "canalCompra": "ONLINE",
  "formaPagamento": "VISTA",
  "modeloVeiculo": "RANGER",
  "dataCompra": "2025-11-20",
  "historicoMarca": "RECOMPRA"
}
"@
Invoke-Test -Name "PUT /clientes/{id} payload invalido (400)" -Method PUT -Url "$baseUrl/clientes/$clienteId" -Headers $hGerente -Body $updateBodyInvalido -ExpectedStatus 400 | Out-Null

# ---------- 6. DELETE /clientes/{id} ----------
Invoke-Test -Name "DELETE /clientes/{id} como GERENTE (403)" -Method DELETE -Url "$baseUrl/clientes/$clienteId" -Headers $hGerente -ExpectedStatus 403 | Out-Null
Invoke-Test -Name "DELETE /clientes/{id} como ADMIN (204)" -Method DELETE -Url "$baseUrl/clientes/$clienteId" -Headers $hAdmin -ExpectedStatus 204 | Out-Null
Invoke-Test -Name "GET /clientes/{id} apos delete (404)" -Method GET -Url "$baseUrl/clientes/$clienteId" -Headers $hGerente -ExpectedStatus 404 | Out-Null

# ---------- 7. DASHBOARD / LEADS ----------
Invoke-Test -Name "GET /dashboard (GERENTE)" -Method GET -Url "$baseUrl/dashboard" -Headers $hGerente -ExpectedStatus 200 | Out-Null
Invoke-Test -Name "GET /leads (ANALISTA)" -Method GET -Url "$baseUrl/leads?scoreMinimo=50" -Headers $hAnalista -ExpectedStatus 200 | Out-Null

# ---------- RESUMO ----------
Write-Log "===================================================================="
Write-Log "RESUMO FINAL"
Write-Log "===================================================================="
$totalPass = ($results | Where-Object { $_.Resultado -eq "PASS" }).Count
$totalFail = ($results | Where-Object { $_.Resultado -eq "FAIL" }).Count
$results | ForEach-Object {
    Write-Log ("{0,-45} esperado={1,-4} obtido={2,-4} {3}" -f $_.Teste, $_.Esperado, $_.Obtido, $_.Resultado)
}
Write-Log ""
Write-Log "TOTAL: $($results.Count) testes | PASS: $totalPass | FAIL: $totalFail"

$results | Export-Csv -Path (Join-Path $evidDir "resumo.csv") -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "===================================================================="  -ForegroundColor Yellow
Write-Host "TOTAL: $($results.Count) testes | PASS: $totalPass | FAIL: $totalFail" -ForegroundColor Yellow
Write-Host "Evidencias salvas em: $evidDir" -ForegroundColor Yellow
Write-Host "===================================================================="  -ForegroundColor Yellow

if ($totalFail -gt 0) {
    Write-Host ""
    Write-Host "Testes que falharam:" -ForegroundColor Red
    $results | Where-Object { $_.Resultado -eq "FAIL" } | Format-Table -AutoSize
}