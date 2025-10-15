#!/usr/bin/env node

/**
 * Script de vérification de la configuration OAuth
 * 
 * Ce script vérifie si toutes les variables d'environnement
 * nécessaires pour OAuth sont configurées.
 */

const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env.local non trouvé !');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    }
  });
  
  return envVars;
}

const OAUTH_CONFIGS = [
  {
    name: 'URL du site',
    envVar: 'NEXT_PUBLIC_SITE_URL',
    required: true,
    description: 'URL de base du site',
    example: 'http://localhost:3000'
  },
  {
    name: 'Client ID OAuth',
    envVar: 'GOOGLE_OAUTH_CLIENT_ID',
    required: true,
    description: 'Client ID Google OAuth',
    example: '123456789-abcdefghijklmnop.apps.googleusercontent.com'
  },
  {
    name: 'Client Secret OAuth',
    envVar: 'GOOGLE_OAUTH_CLIENT_SECRET',
    required: true,
    description: 'Client Secret Google OAuth',
    example: 'GOCSPX-abcdefghijklmnopqrstuvwx'
  },
  {
    name: 'URI de redirection OAuth',
    envVar: 'NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI',
    required: true,
    description: 'URI de redirection OAuth',
    example: 'http://localhost:3000/api/auth/google/callback'
  },
  {
    name: 'Property ID Analytics',
    envVar: 'GOOGLE_ANALYTICS_PROPERTY_ID',
    required: true,
    description: 'ID de propriété Google Analytics',
    example: '123456789'
  },
  {
    name: 'URL Search Console',
    envVar: 'GOOGLE_SEARCH_CONSOLE_SITE_URL',
    required: false,
    description: 'URL du site pour Search Console',
    example: 'https://votre-domaine.com'
  },
  {
    name: 'Clé API PageSpeed',
    envVar: 'GOOGLE_PAGESPEED_API_KEY',
    required: false,
    description: 'Clé API PageSpeed Insights',
    example: 'AIzaSyC...'
  }
];

function checkOAuthConfiguration() {
  console.log('🔍 Vérification de la configuration OAuth Google Analytics\n');
  
  const envVars = loadEnvFile();
  
  let allConfigured = true;
  let missingRequired = 0;
  let missingOptional = 0;

  OAUTH_CONFIGS.forEach((config) => {
    const value = envVars[config.envVar];
    const isConfigured = value && 
      value !== `your-${config.envVar.toLowerCase().replace(/_/g, '-')}` &&
      !value.includes('your-') &&
      !value.includes('example');

    if (config.required) {
      if (isConfigured) {
        console.log(`✅ ${config.name}: Configuré`);
        console.log(`   ${config.envVar}=${value.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${config.name}: MANQUANT`);
        console.log(`   ${config.envVar}=${value || 'Non défini'}`);
        console.log(`   ${config.description}`);
        if (config.example) {
          console.log(`   Exemple: ${config.example}`);
        }
        allConfigured = false;
        missingRequired++;
      }
    } else {
      if (isConfigured) {
        console.log(`✅ ${config.name}: Configuré (optionnel)`);
        console.log(`   ${config.envVar}=${value.substring(0, 20)}...`);
      } else {
        console.log(`⚠️  ${config.name}: Non configuré (optionnel)`);
        console.log(`   ${config.envVar}=${value || 'Non défini'}`);
        missingOptional++;
      }
    }
    console.log('');
  });

  console.log('📊 Résumé de la configuration:');
  console.log(`   Variables requises: ${OAUTH_CONFIGS.filter(c => c.required).length - missingRequired}/${OAUTH_CONFIGS.filter(c => c.required).length} configurées`);
  console.log(`   Variables optionnelles: ${OAUTH_CONFIGS.filter(c => !c.required).length - missingOptional}/${OAUTH_CONFIGS.filter(c => !c.required).length} configurées`);
  
  if (allConfigured) {
    console.log('\n🎉 Configuration OAuth complète !');
    console.log('✅ Le système peut utiliser les vraies données Google');
    console.log('✅ Le client peut se connecter avec Google');
  } else {
    console.log('\n⚠️  Configuration OAuth incomplète !');
    console.log(`❌ ${missingRequired} variable(s) requise(s) manquante(s)`);
    if (missingOptional > 0) {
      console.log(`⚠️  ${missingOptional} variable(s) optionnelle(s) manquante(s)`);
    }
    console.log('\n📋 Actions requises:');
    console.log('1. Créer le fichier .env.local à la racine du projet');
    console.log('2. Ajouter les variables manquantes (voir docs/configuration/CONFIGURATION-ENV-OAUTH.md)');
    console.log('3. Redémarrer le serveur: npm run dev');
  }

  console.log('\n📚 Documentation complète:');
  console.log('   docs/configuration/CONFIGURATION-ENV-OAUTH.md');
  console.log('   docs/integration/OAUTH-SETUP-GUIDE.md');
}

// Exécuter la vérification
checkOAuthConfiguration();
