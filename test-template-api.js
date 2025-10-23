const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTemplateAPI() {
  console.log('🧪 TEST: API /api/admin/templates/active\n');
  console.log('='.repeat(60));
  
  try {
    // Récupérer un tenant user pour simuler
    const tenantUser = await prisma.tenantUser.findFirst({
      where: { isActive: true },
      include: { tenant: { include: { template: true } } }
    });
    
    if (!tenantUser) {
      console.log('❌ Aucun TenantUser trouvé dans la DB');
      return;
    }
    
    console.log('\n📋 TENANT USER DE TEST:');
    console.log(`   Email: ${tenantUser.email}`);
    console.log(`   Tenant: ${tenantUser.tenant.name}`);
    console.log(`   Template: ${tenantUser.tenant.template?.displayName || 'NON TROUVÉ'}`);
    console.log(`   Template ID: ${tenantUser.tenantId}`);
    
    // Simuler ce que l'API devrait faire
    console.log('\n🔄 SIMULATION API:');
    console.log(`   1. User authentifié: ${tenantUser.email}`);
    console.log(`   2. TenantId: ${tenantUser.tenantId}`);
    console.log(`   3. Query: tenant.findUnique({ where: { id: "${tenantUser.tenantId}" } })`);
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantUser.tenantId },
      include: {
        template: {
          include: {
            sidebarConfigs: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });
    
    console.log('\n✅ RÉSULTAT QUERY:');
    console.log(`   Tenant: ${tenant.name}`);
    console.log(`   Template: ${tenant.template.displayName}`);
    console.log(`   SidebarConfigs: ${tenant.template.sidebarConfigs.length}`);
    
    if (tenant.template.sidebarConfigs.length > 0) {
      console.log('\n📝 ÉLÉMENTS SIDEBAR:');
      tenant.template.sidebarConfigs.forEach((config, i) => {
        console.log(`   ${i + 1}. ${config.label} (${config.elementId})`);
        console.log(`      - Icon: ${config.icon}`);
        console.log(`      - Href: ${config.href}`);
        console.log(`      - Order: ${config.orderIndex}`);
      });
    }
    
    // Tester l'API sidebar
    console.log('\n🔄 TEST API SIDEBAR:');
    console.log(`   /api/admin/sidebar/${tenant.template.id}`);
    
    const sidebarConfigs = await prisma.templateSidebarConfig.findMany({
      where: { templateId: tenant.template.id },
      orderBy: { orderIndex: 'asc' }
    });
    
    console.log(`   ✅ Retour: ${sidebarConfigs.length} éléments`);
    sidebarConfigs.forEach((config, i) => {
      console.log(`   ${i + 1}. ${config.label} (${config.elementId})`);
    });
    
    console.log('\n✅ API fonctionne correctement en théorie!');
    console.log('\n⚠️  SI LA SIDEBAR NE S\'AFFICHE PAS:');
    console.log('   1. Vérifier la console browser (F12)');
    console.log('   2. Vérifier les requêtes Network');
    console.log('   3. Vérifier que useTemplate() récupère le template');
    console.log('   4. Vérifier que AdminSidebar affiche templateSidebarElements');
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTemplateAPI();

