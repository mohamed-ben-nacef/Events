import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  response?: any;
}

const results: TestResult[] = [];
let accessToken = '';
let refreshToken = '';
let adminUserId = '';
let categoryId = '';
let equipmentId = '';
let eventId = '';
let vehicleId = '';

async function test(name: string, testFn: () => Promise<any>): Promise<void> {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const response = await testFn();
    results.push({ name, success: true, response: response?.data || response });
    console.log(`✅ ${name} - SUCCESS`);
    if (response?.data) {
      console.log(`   Response:`, JSON.stringify(response.data, null, 2).substring(0, 200));
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
    results.push({ name, success: false, error: errorMsg });
    console.log(`❌ ${name} - FAILED: ${errorMsg}`);
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  // ============================================
  // AUTHENTICATION TESTS
  // ============================================
  console.log('\n📋 ============================================');
  console.log('📋 AUTHENTICATION TESTS');
  console.log('📋 ============================================\n');

  await test('Health Check', async () => {
    return axios.get(`${BASE_URL}/health`);
  });

  await test('Database Check', async () => {
    return axios.get(`${BASE_URL}/db-check`);
  });

  await test('Login - Admin', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'AdminPass123!',
    });
    accessToken = response.data.data.tokens.access_token;
    refreshToken = response.data.data.tokens.refresh_token;
    adminUserId = response.data.data.user.id;
    return response;
  });

  await test('Get Current User (Me)', async () => {
    return axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  // ============================================
  // CATEGORIES TESTS
  // ============================================
  console.log('\n📋 ============================================');
  console.log('📋 CATEGORIES TESTS');
  console.log('📋 ============================================\n');

  await test('Get All Categories', async () => {
    const response = await axios.get(`${BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.data.data?.categories?.length > 0) {
      categoryId = response.data.data.categories[0].id;
    }
    return response;
  });

  await test('Get Category by ID', async () => {
    if (!categoryId) throw new Error('No category ID available');
    return axios.get(`${BASE_URL}/categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  // ============================================
  // EQUIPMENT TESTS
  // ============================================
  console.log('\n📋 ============================================');
  console.log('📋 EQUIPMENT TESTS');
  console.log('📋 ============================================\n');

  await test('Get All Equipment', async () => {
    const response = await axios.get(`${BASE_URL}/equipment`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10 },
    });
    if (response.data.data?.equipment?.length > 0) {
      equipmentId = response.data.data.equipment[0].id;
    }
    return response;
  });

  await test('Get Equipment by ID', async () => {
    if (!equipmentId) throw new Error('No equipment ID available');
    return axios.get(`${BASE_URL}/equipment/${equipmentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  await test('Search Equipment', async () => {
    return axios.get(`${BASE_URL}/equipment`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { search: 'microphone', limit: 5 },
    });
  });

  await test('Filter Equipment by Category', async () => {
    if (!categoryId) throw new Error('No category ID available');
    return axios.get(`${BASE_URL}/equipment`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { category_id: categoryId, limit: 5 },
    });
  });

  await test('Get Equipment Availability', async () => {
    if (!equipmentId) throw new Error('No equipment ID available');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    return axios.get(`${BASE_URL}/equipment/${equipmentId}/availability`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
  });

  await test('Get Equipment History', async () => {
    if (!equipmentId) throw new Error('No equipment ID available');
    return axios.get(`${BASE_URL}/equipment/${equipmentId}/history`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  // ============================================
  // EVENTS TESTS
  // ============================================
  console.log('\n📋 ============================================');
  console.log('📋 EVENTS TESTS');
  console.log('📋 ============================================\n');

  await test('Get All Events', async () => {
    const response = await axios.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10 },
    });
    if (response.data.data?.events?.length > 0) {
      eventId = response.data.data.events[0].id;
    }
    return response;
  });

  await test('Get Event by ID', async () => {
    if (!eventId) throw new Error('No event ID available');
    return axios.get(`${BASE_URL}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  await test('Filter Events by Status', async () => {
    return axios.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { status: 'PLANIFIE', limit: 5 },
    });
  });

  await test('Get Event Equipment', async () => {
    if (!eventId) throw new Error('No event ID available');
    return axios.get(`${BASE_URL}/events/${eventId}/equipment`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  // ============================================
  // MAINTENANCE TESTS
  // ============================================
  console.log('\n📋 ============================================');
  console.log('📋 MAINTENANCE TESTS');
  console.log('📋 ============================================\n');

  await test('Get All Maintenances', async () => {
    return axios.get(`${BASE_URL}/maintenances`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10 },
    });
  });

  await test('Filter Maintenances by Status', async () => {
    return axios.get(`${BASE_URL}/maintenances`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { status: 'EN_ATTENTE', limit: 5 },
    });
  });

  // ============================================
  // VEHICLES & TRANSPORT TESTS
  // ============================================
  console.log('\n📋 ============================================');
  console.log('📋 VEHICLES & TRANSPORT TESTS');
  console.log('📋 ============================================\n');

  await test('Get All Vehicles', async () => {
    const response = await axios.get(`${BASE_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.data.data?.vehicles?.length > 0) {
      vehicleId = response.data.data.vehicles[0].id;
    }
    return response;
  });

  await test('Get Vehicle by ID', async () => {
    if (!vehicleId) throw new Error('No vehicle ID available');
    return axios.get(`${BASE_URL}/vehicles/${vehicleId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  await test('Filter Vehicles by Status', async () => {
    return axios.get(`${BASE_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { status: 'DISPONIBLE' },
    });
  });

  await test('Get All Transports', async () => {
    return axios.get(`${BASE_URL}/vehicles/transports/all`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  // ============================================
  // USERS TESTS
  // ============================================
  console.log('\n📋 ============================================');
  console.log('📋 USERS TESTS');
  console.log('📋 ============================================\n');

  await test('Get All Users', async () => {
    return axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  await test('Filter Users by Role', async () => {
    return axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { role: 'TECHNICIEN' },
    });
  });

  // ============================================
  // WHATSAPP TESTS
  // ============================================
  console.log('\n📋 ============================================');
  console.log('📋 WHATSAPP TESTS');
  console.log('📋 ============================================\n');

  await test('Get WhatsApp History', async () => {
    return axios.get(`${BASE_URL}/whatsapp-messages`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10 },
    });
  });

  // ============================================
  // ACTIVITY LOGS TESTS
  // ============================================
  console.log('\n📋 ============================================');
  console.log('📋 ACTIVITY LOGS TESTS');
  console.log('📋 ============================================\n');

  await test('Get Activity Logs', async () => {
    return axios.get(`${BASE_URL}/activity-logs`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10 },
    });
  });

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n\n📊 ============================================');
  console.log('📊 TEST SUMMARY');
  console.log('📊 ============================================\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('❌ Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }

  console.log('\n✨ Testing completed!');
}

// Run tests
runTests().catch(console.error);
