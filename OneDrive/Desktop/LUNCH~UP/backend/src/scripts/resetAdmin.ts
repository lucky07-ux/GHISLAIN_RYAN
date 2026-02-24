/**
 * Script to reset admin credentials
 * Usage: npx tsx src/scripts/resetAdmin.ts
 */

import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import bcryptjs from 'bcryptjs';

const resetAdmin = async () => {
  try {
    console.log('🔄 Réinitialisation des identifiants admin...');
    
    // Connexion
    await mongoose.connect(config.mongoUri);
    console.log('✓ Connecté à MongoDB');

    // Supprimer l'ancien admin
    await User.deleteMany({ email: config.admin.email });
    console.log('ℹ Ancien admin supprimé');

    // Créer un nouvel admin (password sera hashé par le pre-save hook)
    const newAdmin = await User.create({
      email: config.admin.email,
      password: config.admin.password,
      name: 'Administrateur LunchUp',
      role: 'super_admin',
    });
    
    console.log('✓ Nouvel admin créé avec succès!');
    console.log('\n📋 Nouvelles identifiants:');
    console.log(`  Email: ${config.admin.email}`);
    console.log(`  Password: ${config.admin.password}`);
    console.log(`  User ID: ${newAdmin._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Erreur:', error);
    process.exit(1);
  }
};

resetAdmin();
