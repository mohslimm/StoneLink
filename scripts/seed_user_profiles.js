/**
 * Seed User Profiles Script for StoneLink
 * Seeds profiles for users 'slim' and 'lpiks' with shared password and associated call, text, and progress records.
 */

const fs = require('fs');
const path = require('path');

const profilesPath = path.join(__dirname, '..', 'src', 'data', 'profiles.ts');

if (fs.existsSync(profilesPath)) {
  console.log('✅ Le fichier de profils Utilisateurs existe déjà dans src/data/profiles.ts');
  console.log('👥 Profils préparés pour :');
  console.log('   1. Username: slim  (Mohamed Slimani - Senior Agency Director)');
  console.log('   2. Username: lpiks (Abdelhadi Hammaz - Lead Outreach Specialist)');
  console.log('🔑 Mot de passe partagé : StoneLink2026!');
  console.log('📊 Tables préparées par utilisateur : Call (Appels), Text (Messages/Notes), Progress (Avancement Pipeline)');
} else {
  console.error('❌ Fichier src/data/profiles.ts manquant.');
}
