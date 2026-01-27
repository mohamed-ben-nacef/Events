import dotenv from 'dotenv';
import { sequelize, User, Category, Subcategory, Equipment, Event, Vehicle } from '../models/index';
import bcrypt from 'bcrypt';
import { generateEquipmentReference } from '../utils/referenceGenerator';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Database synced');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await sequelize.sync({ force: true });

    // ============================================
    // 1. CREATE USERS
    // ============================================
    console.log('\n📝 Creating users...');

    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);

    const [admin, maintenance, technicien] = await Promise.all([
      User.findOrCreate({
        where: { email: 'admin@example.com' },
        defaults: {
          email: 'admin@example.com',
          password_hash: hashedPassword,
          full_name: 'Admin User',
          phone: '+21612345678',
          role: 'ADMIN',
          is_active: true,
          is_email_verified: true,
        },
      }),
      User.findOrCreate({
        where: { email: 'maintenance@example.com' },
        defaults: {
          email: 'maintenance@example.com',
          password_hash: hashedPassword,
          full_name: 'Maintenance User',
          phone: '+21612345679',
          role: 'MAINTENANCE',
          is_active: true,
          is_email_verified: true,
        },
      }),
      User.findOrCreate({
        where: { email: 'technicien@example.com' },
        defaults: {
          email: 'technicien@example.com',
          password_hash: hashedPassword,
          full_name: 'Technicien User',
          phone: '+21612345680',
          role: 'TECHNICIEN',
          is_active: true,
          is_email_verified: true,
        },
      }),
    ]);

    const adminUser = admin[0];
    const maintenanceUser = maintenance[0];
    const technicienUser = technicien[0];

    console.log(`✅ Created users: ${adminUser.full_name}, ${maintenanceUser.full_name}, ${technicienUser.full_name}`);

    // ============================================
    // 2. CREATE CATEGORIES
    // ============================================
    console.log('\n📦 Creating categories...');

    const [sonCategory, videoCategory, lumiereCategory] = await Promise.all([
      Category.findOrCreate({
        where: { name: 'SON' },
        defaults: {
          name: 'SON',
          description: 'Équipements audio : microphones, enceintes, tables de mixage, amplificateurs',
          icon: '🔊',
        },
      }),
      Category.findOrCreate({
        where: { name: 'VIDEO' },
        defaults: {
          name: 'VIDEO',
          description: 'Équipements vidéo : projecteurs, écrans, caméras, mélangeurs vidéo',
          icon: '📹',
        },
      }),
      Category.findOrCreate({
        where: { name: 'LUMIERE' },
        defaults: {
          name: 'LUMIERE',
          description: 'Équipements d\'éclairage : projecteurs LED, lyres, stroboscopes, consoles DMX',
          icon: '💡',
        },
      }),
    ]);

    const sonCat = sonCategory[0];
    const videoCat = videoCategory[0];
    const lumiereCat = lumiereCategory[0];

    console.log(`✅ Created categories: ${sonCat.name}, ${videoCat.name}, ${lumiereCat.name}`);

    // ============================================
    // 3. CREATE SUBCATEGORIES
    // ============================================
    console.log('\n📋 Creating subcategories...');

    const subcategories = [
      // SON subcategories
      { category_id: sonCat.id, name: 'Microphones', description: 'Microphones sans fil et filaires' },
      { category_id: sonCat.id, name: 'Enceintes', description: 'Enceintes actives et passives' },
      { category_id: sonCat.id, name: 'Tables de mixage', description: 'Tables de mixage analogiques et numériques' },
      { category_id: sonCat.id, name: 'Amplificateurs', description: 'Amplificateurs de puissance' },
      { category_id: sonCat.id, name: 'Câbles audio', description: 'Câbles XLR, Jack, RCA' },

      // VIDEO subcategories
      { category_id: videoCat.id, name: 'Projecteurs', description: 'Projecteurs vidéo et vidéoprojecteurs' },
      { category_id: videoCat.id, name: 'Écrans', description: 'Écrans de projection et écrans LED' },
      { category_id: videoCat.id, name: 'Caméras', description: 'Caméras professionnelles et webcams' },
      { category_id: videoCat.id, name: 'Mélangeurs vidéo', description: 'Mélangeurs et switchers vidéo' },
      { category_id: videoCat.id, name: 'Câbles vidéo', description: 'Câbles HDMI, SDI, VGA' },

      // LUMIERE subcategories
      { category_id: lumiereCat.id, name: 'Projecteurs LED', description: 'Projecteurs LED RGB et RGBW' },
      { category_id: lumiereCat.id, name: 'Lyres', description: 'Lyres et structures d\'éclairage' },
      { category_id: lumiereCat.id, name: 'Stroboscopes', description: 'Stroboscopes et effets lumineux' },
      { category_id: lumiereCat.id, name: 'Consoles DMX', description: 'Consoles de contrôle DMX' },
      { category_id: lumiereCat.id, name: 'Câbles DMX', description: 'Câbles DMX et XLR-5' },
    ];

    const createdSubcategories = [];
    for (const sub of subcategories) {
      const [subcat] = await Subcategory.findOrCreate({
        where: { name: sub.name, category_id: sub.category_id },
        defaults: sub,
      });
      createdSubcategories.push(subcat);
    }

    console.log(`✅ Created ${createdSubcategories.length} subcategories`);

    // ============================================
    // 4. CREATE EQUIPMENT
    // ============================================
    console.log('\n🎛️ Creating equipment...');

    const equipmentData = [
      // SON Equipment
      {
        name: 'Microphone Sans Fil Shure SM58',
        category_id: sonCat.id,
        subcategory_id: createdSubcategories[0].id, // Microphones
        brand: 'Shure',
        model: 'SM58',
        description: 'Microphone sans fil professionnel pour voix',
        technical_specs: 'Fréquence: 50Hz-15kHz, Impédance: 150Ω',
        quantity_total: 10,
        quantity_available: 8,
        purchase_price: 150.00,
        daily_rental_price: 25.00,
        supplier: 'Shure Distribution',
        weight_kg: 0.3,
      },
      {
        name: 'Enceinte Active JBL PRX815W',
        category_id: sonCat.id,
        subcategory_id: createdSubcategories[1].id, // Enceintes
        brand: 'JBL',
        model: 'PRX815W',
        description: 'Enceinte active 15 pouces 2000W',
        technical_specs: 'Puissance: 2000W, Réponse: 52Hz-20kHz',
        quantity_total: 6,
        quantity_available: 4,
        purchase_price: 1200.00,
        daily_rental_price: 150.00,
        supplier: 'JBL Pro',
        weight_kg: 15.5,
      },
      {
        name: 'Table de Mixage Behringer X32',
        category_id: sonCat.id,
        subcategory_id: createdSubcategories[2].id, // Tables de mixage
        brand: 'Behringer',
        model: 'X32',
        description: 'Console numérique 32 canaux',
        technical_specs: '32 entrées, 16 sorties, 6 auxiliaires',
        quantity_total: 3,
        quantity_available: 2,
        purchase_price: 2500.00,
        daily_rental_price: 300.00,
        supplier: 'Behringer',
        weight_kg: 12.0,
      },

      // VIDEO Equipment
      {
        name: 'Vidéoprojecteur Epson EB-X41',
        category_id: videoCat.id,
        subcategory_id: createdSubcategories[5].id, // Projecteurs
        brand: 'Epson',
        model: 'EB-X41',
        description: 'Vidéoprojecteur XGA 3600 lumens',
        technical_specs: 'Résolution: 1024x768, Luminosité: 3600 lumens',
        quantity_total: 8,
        quantity_available: 6,
        purchase_price: 800.00,
        daily_rental_price: 80.00,
        supplier: 'Epson',
        weight_kg: 2.8,
      },
      {
        name: 'Écran de Projection 3x4m',
        category_id: videoCat.id,
        subcategory_id: createdSubcategories[6].id, // Écrans
        brand: 'Elite Screens',
        model: 'SableFrame',
        description: 'Écran de projection motorisé 3x4 mètres',
        technical_specs: 'Format: 16:9, Gain: 1.1',
        quantity_total: 5,
        quantity_available: 4,
        purchase_price: 600.00,
        daily_rental_price: 60.00,
        supplier: 'Elite Screens',
        weight_kg: 25.0,
      },
      {
        name: 'Caméra Canon XA50',
        category_id: videoCat.id,
        subcategory_id: createdSubcategories[7].id, // Caméras
        brand: 'Canon',
        model: 'XA50',
        description: 'Caméra professionnelle 4K',
        technical_specs: '4K UHD, Zoom optique 15x',
        quantity_total: 4,
        quantity_available: 3,
        purchase_price: 2000.00,
        daily_rental_price: 200.00,
        supplier: 'Canon',
        weight_kg: 1.2,
      },

      // LUMIERE Equipment
      {
        name: 'Projecteur LED RGB 50W',
        category_id: lumiereCat.id,
        subcategory_id: createdSubcategories[10].id, // Projecteurs LED
        brand: 'Eurolite',
        model: 'LED PAR-56 RGB',
        description: 'Projecteur LED RGB 50W avec contrôle DMX',
        technical_specs: 'Puissance: 50W, DMX: 7 canaux',
        quantity_total: 20,
        quantity_available: 18,
        purchase_price: 120.00,
        daily_rental_price: 15.00,
        supplier: 'Eurolite',
        weight_kg: 1.5,
      },
      {
        name: 'Console DMX GrandMA2',
        category_id: lumiereCat.id,
        subcategory_id: createdSubcategories[13].id, // Consoles DMX
        brand: 'MA Lighting',
        model: 'GrandMA2',
        description: 'Console de contrôle lumière professionnelle',
        technical_specs: '8192 canaux DMX, 64 univers',
        quantity_total: 2,
        quantity_available: 1,
        purchase_price: 15000.00,
        daily_rental_price: 500.00,
        supplier: 'MA Lighting',
        weight_kg: 8.0,
      },
    ];

    const createdEquipment = [];
    for (const eq of equipmentData) {
      // Generate reference for each equipment
      const reference = await generateEquipmentReference(eq.category_id);
      const [equipment] = await Equipment.findOrCreate({
        where: { name: eq.name },
        defaults: {
          ...eq,
          reference,
        },
      });
      createdEquipment.push(equipment);
    }

    console.log(`✅ Created ${createdEquipment.length} equipment items`);

    // ============================================
    // 5. CREATE EVENTS
    // ============================================
    console.log('\n📅 Creating events...');

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    const eventsData = [
      {
        event_name: 'Concert Rock Festival',
        client_name: 'Rock Events Ltd',
        contact_person: 'Jean Dupont',
        phone: '+21698765432',
        email: 'jean@rockevents.com',
        address: 'Stade Olympique, Tunis',
        installation_date: new Date(nextWeek),
        event_date: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000),
        dismantling_date: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        category: 'MIXTE' as const,
        status: 'PLANIFIE' as const,
        notes: 'Grand événement avec son, vidéo et lumière',
        budget: 5000.00,
        participant_count: 5000,
        event_type: 'Concert',
        created_by: adminUser.id,
      },
      {
        event_name: 'Conférence Entreprise',
        client_name: 'TechCorp',
        contact_person: 'Marie Martin',
        phone: '+21698765433',
        email: 'marie@techcorp.com',
        address: 'Centre de Conférences, Tunis',
        installation_date: new Date(nextMonth),
        event_date: new Date(nextMonth.getTime() + 24 * 60 * 60 * 1000),
        dismantling_date: new Date(nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
        category: 'VIDEO' as const,
        status: 'PLANIFIE' as const,
        notes: 'Besoin de projecteurs et écrans',
        budget: 2000.00,
        participant_count: 200,
        event_type: 'Conférence',
        created_by: adminUser.id,
      },
      {
        event_name: 'Mariage Premium',
        client_name: 'Famille Ben Ali',
        contact_person: 'Ahmed Ben Ali',
        phone: '+21698765434',
        email: 'ahmed@example.com',
        address: 'Palais des Fêtes, Sousse',
        installation_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        event_date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        dismantling_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        category: 'LUMIERE' as const,
        status: 'EN_COURS' as const,
        notes: 'Éclairage décoratif et ambiance',
        budget: 1500.00,
        participant_count: 300,
        event_type: 'Mariage',
        created_by: adminUser.id,
      },
    ];

    const createdEvents = [];
    for (const evt of eventsData) {
      const [event] = await Event.findOrCreate({
        where: { event_name: evt.event_name, event_date: evt.event_date },
        defaults: evt,
      });
      createdEvents.push(event);
    }

    console.log(`✅ Created ${createdEvents.length} events`);

    // ============================================
    // 6. CREATE VEHICLES
    // ============================================
    console.log('\n🚚 Creating vehicles...');

    const vehiclesData = [
      {
        registration_number: 'TN-1234-AB',
        type: 'CAMION' as const,
        brand: 'Mercedes',
        model: 'Sprinter',
        load_capacity_kg: 3500,
        cargo_dimensions: '6m x 2m x 2.5m',
        insurance_expiry: new Date('2025-12-31'),
        technical_inspection_expiry: new Date('2025-06-30'),
        fuel_type: 'Diesel',
        current_mileage: 45000,
        status: 'DISPONIBLE' as const,
      },
      {
        registration_number: 'TN-5678-CD',
        type: 'UTILITAIRE' as const,
        brand: 'Renault',
        model: 'Master',
        load_capacity_kg: 2000,
        cargo_dimensions: '4m x 1.8m x 2m',
        insurance_expiry: new Date('2025-11-30'),
        technical_inspection_expiry: new Date('2025-05-31'),
        fuel_type: 'Diesel',
        current_mileage: 32000,
        status: 'DISPONIBLE' as const,
      },
      {
        registration_number: 'TN-9012-EF',
        type: 'VOITURE' as const,
        brand: 'Peugeot',
        model: 'Partner',
        load_capacity_kg: 800,
        cargo_dimensions: '2.5m x 1.5m x 1.2m',
        insurance_expiry: new Date('2025-10-31'),
        technical_inspection_expiry: new Date('2025-04-30'),
        fuel_type: 'Essence',
        current_mileage: 28000,
        status: 'EN_SERVICE' as const,
      },
    ];

    const createdVehicles = [];
    for (const veh of vehiclesData) {
      const [vehicle] = await Vehicle.findOrCreate({
        where: { registration_number: veh.registration_number },
        defaults: veh,
      });
      createdVehicles.push(vehicle);
    }

    console.log(`✅ Created ${createdVehicles.length} vehicles`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 3`);
    console.log(`   - Categories: 3`);
    console.log(`   - Subcategories: ${createdSubcategories.length}`);
    console.log(`   - Equipment: ${createdEquipment.length}`);
    console.log(`   - Events: ${createdEvents.length}`);
    console.log(`   - Vehicles: ${createdVehicles.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@example.com / AdminPass123!');
    console.log('   Maintenance: maintenance@example.com / AdminPass123!');
    console.log('   Technicien: technicien@example.com / AdminPass123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('\n✨ Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
