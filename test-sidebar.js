const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSidebarManagement() {
  console.log('🧪 TEST: Gestion sidebar pour Rose\n');
  
  try {
    // 1. Trouver Rose
    const rose = await prisma.tenantUser.findFirst({
      where: { email: 'Rose@purplenails.fr' },
      include: { tenant: { include: { template: true } } }
    });
    
    if (!rose) {
      console.log('❌ Rose non trouvée');
      return;
    }
    
    console.log(`✅ Rose trouvée: ${rose.tenant.name}`);
    console.log(`   Template: ${rose.tenant.template.displayName}`);
    console.log(`   Template ID: ${rose.tenant.templateId}`);
    
    // 2. Vérifier les éléments actuels
    const currentElements = await prisma.templateSidebarConfig.findMany({
      where: { templateId: rose.tenant.templateId },
      orderBy: { orderIndex: 'asc' }
    });
    
    console.log(`\n📋 Éléments actuels (${currentElements.length}):`);
    currentElements.forEach((el, i) => {
      console.log(`   ${i + 1}. ${el.label} (${el.elementId}) - Required: ${el.isRequired}`);
    });
    
    // 3. Ajouter un élément de test (Projets)
    const testElement = {
      templateId: rose.tenant.templateId,
      elementId: 'projets',
      label: 'Projets',
      icon: 'Briefcase',
      href: '/admin/projets',
      orderIndex: 999, // À la fin
      category: 'CONTENT',
      isRequired: false // ← Supprimable !
    };
    
    // Vérifier si déjà présent
    const exists = await prisma.templateSidebarConfig.findFirst({
      where: {
        templateId: rose.tenant.templateId,
        elementId: 'projets'
      }
    });
    
    if (exists) {
      console.log('\n⚠️  Élément "Projets" existe déjà');
    } else {
      await prisma.templateSidebarConfig.create({
        data: testElement
      });
      console.log('\n✅ Élément "Projets" ajouté (supprimable)');
    }
    
    // 4. Vérifier le résultat final
    const finalElements = await prisma.templateSidebarConfig.findMany({
      where: { templateId: rose.tenant.templateId },
      orderBy: { orderIndex: 'asc' }
    });
    
    console.log(`\n📋 Éléments finaux (${finalElements.length}):`);
    finalElements.forEach((el, i) => {
      const badge = el.isRequired ? '🔒' : '✅';
      console.log(`   ${i + 1}. ${badge} ${el.label} (${el.elementId})`);
    });
    
    console.log('\n🎯 TEST:');
    console.log('1. Allez sur /super-admin/dashboard');
    console.log('2. Cliquez sur Layout pour Rose');
    console.log('3. Vous devriez voir "Projets" avec un bouton poubelle 🗑️');
    console.log('4. Les éléments template (Soins, Rendez-vous) n\'ont PAS de bouton poubelle');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSidebarManagement();

