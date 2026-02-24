/**
 * Script d'initialisation MongoDB pour LunchUp
 * Exécute les seeders pour initialiser les données par défaut
 * 
 * Usage: node dist/scripts/seed.js ou npm run seed
 */

import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import bcryptjs from 'bcryptjs';

const seed = async () => {
  try {
    console.log('🌱 Initialisation de la base de données...');
    
    // Connexion
    await mongoose.connect(config.mongoUri);
    console.log('✓ Connecté à MongoDB');

    // Vérifier si admin existe
    const adminExists = await User.findOne({ email: config.admin.email });
    
    if (!adminExists) {
      const hashedPassword = await bcryptjs.hash(config.admin.password, 10);
      
      await User.create({
        email: config.admin.email,
        password: hashedPassword,
        name: 'Administrateur LunchUp',
        role: 'super_admin',
      });
      
      console.log('✓ Admin créé:', config.admin.email);
    } else {
      console.log('ℹ Admin existe déjà');
    }

    // Paramètres par défaut
    const settingsExists = await Settings.findOne();
    
    if (!settingsExists) {
      await Settings.create({
        businessInfo: {
          name: 'LunchUp',
          phone: '+237 6 91 71 02 89',
          email: 'contact@lunchup.cm',
          address: 'Yaoundé, Cameroun',
          hours: 'Lundi-Vendredi: 8H-15H',
        },
        pricing: {
          deliveryFee: 1000,
        },
        payment: {
          orangeMoneyNumber: '+237691710289',
          mtnMomoNumber: '+237691710289',
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
        },
      });
      
      console.log('✓ Paramètres créés');
    } else {
      console.log('ℹ Paramètres existent déjà');
    }

    console.log('\n✨ Initialisation terminée avec succès!');
    console.log('\nConnexion admin:');
    console.log(`  Email: ${config.admin.email}`);
    console.log(`  Password: ${config.admin.password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Erreur:', error);
    process.exit(1);
  }
};

seed();
