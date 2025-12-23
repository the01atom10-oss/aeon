# Script de setup DATABASE_URL cho local development
# Chay: .\SETUP_ENV.ps1

$envFile = ".env"
$databaseUrl = "postgresql://postgres:9Carataloonline.@localhost:5432/carat9_reward?schema=public"

Write-Host "Setting up DATABASE_URL..." -ForegroundColor Cyan

# Kiem tra file .env
if (Test-Path $envFile) {
    Write-Host "File .env exists" -ForegroundColor Green
    
    # Doc noi dung file
    $content = Get-Content $envFile -Raw
    
    # Kiem tra xem co DATABASE_URL chua
    if ($content -match "DATABASE_URL\s*=") {
        Write-Host "Updating existing DATABASE_URL..." -ForegroundColor Yellow
        # Thay the DATABASE_URL cu
        $content = $content -replace "DATABASE_URL\s*=.*", "DATABASE_URL=`"$databaseUrl`""
    } else {
        Write-Host "Adding DATABASE_URL..." -ForegroundColor Yellow
        # Them DATABASE_URL vao dau file
        $content = "DATABASE_URL=`"$databaseUrl`"`r`n`r`n" + $content
    }
    
    # Ghi lai file
    Set-Content -Path $envFile -Value $content -NoNewline
    Write-Host "Updated .env file" -ForegroundColor Green
} else {
    Write-Host "Creating new .env file..." -ForegroundColor Yellow
    # Tao file .env moi
    $envContent = "# Database Configuration - 9Carat`r`n"
    $envContent += "DATABASE_URL=`"$databaseUrl`"`r`n`r`n"
    $envContent += "# NextAuth Configuration`r`n"
    $envContent += "NEXTAUTH_SECRET=`"C7qY3kvsK+05MeDL1zSQnvQz7ZvOVNwZWyXDMt7VeO0=`"`r`n"
    $envContent += "NEXTAUTH_URL=`"http://localhost:3000`"`r`n`r`n"
    $envContent += "# Public Base URL`r`n"
    $envContent += "NEXT_PUBLIC_BASE_URL=`"http://localhost:3000`"`r`n"
    $envContent += "NEXT_PUBLIC_APP_URL=`"http://localhost:3000`"`r`n`r`n"
    $envContent += "# Supabase Configuration`r`n"
    $envContent += "NEXT_PUBLIC_SUPABASE_URL=`"https://cwqlafntqzwiqydxgust.supabase.co`"`r`n"
    $envContent += "NEXT_PUBLIC_SUPABASE_ANON_KEY=`"sb_publishable_s3V_MgquuQHdDtDrlHsdnQ_EcVUeH99`"`r`n`r`n"
    $envContent += "# Node Environment`r`n"
    $envContent += "NODE_ENV=`"development`"`r`n"
    
    Set-Content -Path $envFile -Value $envContent
    Write-Host "Created .env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Green
Write-Host "DATABASE_URL: $databaseUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please restart your dev server (npm run dev) for changes to take effect!" -ForegroundColor Yellow

