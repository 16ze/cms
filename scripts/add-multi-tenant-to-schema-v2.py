#!/usr/bin/env python3
"""
Script CORRIGÉ pour ajouter l'architecture multi-tenant au schema Prisma
Auteur: KAIRO Digital
Date: 23 Octobre 2025
Version: 2.0 (Fix duplication bug)
"""

import re
import sys

# Modèles qui doivent recevoir tenantId
MODELS_TO_ADD_TENANT_ID = [
    'BeautyTreatment',
    'BeautyAppointment',
    'WellnessCourse',
    'WellnessCoach',
    'WellnessBooking',
    'Product',
    'Order',
    'OrderItem',
    'Article',
    'ArticleCategory',
    'Author',
    'MenuItem',
    'RestaurantReservation',
    'RestaurantTable',
    'Project',
    'TeamMember',
    'Patient',
    'Therapist',
    'ConsultationAppointment',
    'ServiceClient',
    'ServiceProject',
    'Quote',
    'Invoice',
    'GalleryItem',
]

# Nouveaux modèles à ajouter
NEW_MODELS = '''
// ===== MULTI-TENANT SYSTEM =====

// Super Admin (KAIRO Digital Developer)
model SuperAdmin {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String   // Hash bcrypt
  firstName   String
  lastName    String
  isActive    Boolean  @default(true)
  lastLogin   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([email])
  @@index([isActive])
}

// Tenant (Client)
model Tenant {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  email         String   @unique
  templateId    String
  domain        String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  template                  Template @relation(fields: [templateId], references: [id])
  users                     TenantUser[]
  siteTemplate              SiteTemplate?
  
  // Relations vers données
  beautyTreatments          BeautyTreatment[]
  beautyAppointments        BeautyAppointment[]
  wellnessCourses           WellnessCourse[]
  wellnessCoaches           WellnessCoach[]
  wellnessBookings          WellnessBooking[]
  products                  Product[]
  orders                    Order[]
  orderItems                OrderItem[]
  articles                  Article[]
  articleCategories         ArticleCategory[]
  authors                   Author[]
  menuItems                 MenuItem[]
  restaurantReservations    RestaurantReservation[]
  restaurantTables          RestaurantTable[]
  projects                  Project[]
  teamMembers               TeamMember[]
  patients                  Patient[]
  therapists                Therapist[]
  consultationAppointments  ConsultationAppointment[]
  serviceClients            ServiceClient[]
  serviceProjects           ServiceProject[]
  quotes                    Quote[]
  invoices                  Invoice[]
  galleryItems              GalleryItem[]
  
  @@index([slug])
  @@index([templateId])
  @@index([email])
  @@index([isActive])
}

// Tenant User (User of a client)
model TenantUser {
  id          String         @id @default(uuid())
  tenantId    String
  email       String
  password    String
  firstName   String
  lastName    String
  role        TenantUserRole @default(ADMIN)
  isActive    Boolean        @default(true)
  lastLogin   DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  
  tenant      Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([email])
  @@index([isActive])
}

enum TenantUserRole {
  OWNER
  ADMIN
  EDITOR
  VIEWER
}

'''

def add_tenant_id_to_model_safe(model_text, model_name):
    """
    Ajoute tenantId à un modèle de manière sûre
    EVITE LES DUPLICATIONS
    """
    lines = model_text.split('\n')
    
    # Vérifier si tenantId existe déjà
    if any('tenantId' in line for line in lines):
        print(f'⚠️  {model_name} a déjà tenantId, skip')
        return model_text
    
    result_lines = []
    tenant_id_added = False
    relation_added = False
    index_added = False
    
    for i, line in enumerate(lines):
        result_lines.append(line)
        
        # Ajouter tenantId après l'id
        if '  id ' in line and '@id' in line and not tenant_id_added:
            result_lines.append('  tenantId    String')
            tenant_id_added = True
            print(f'    + tenantId ajouté')
        
        # Ajouter relation Tenant avant le premier @@index
        if line.strip().startswith('@@index') and not relation_added:
            result_lines.insert(-1, '  ')
            result_lines.insert(-1, '  tenant      Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)')
            relation_added = True
            print(f'    + relation Tenant ajoutée')
        
    # Ajouter l'index tenantId à la fin si pas déjà là
    if not index_added and '@@index([tenantId])' not in model_text:
        # Trouver le dernier @@index
        last_index_line = -1
        for i in range(len(result_lines) - 1, -1, -1):
            if '@@index' in result_lines[i]:
                last_index_line = i
                break
        
        if last_index_line >= 0:
            result_lines.insert(last_index_line + 1, '  @@index([tenantId])')
            print(f'    + index tenantId ajouté')
    
    return '\n'.join(result_lines)

def process_schema_safe(schema_content):
    """Traite le schema complet de manière sûre"""
    
    print('\n📋 ÉTAPE 1: Ajout des nouveaux modèles...')
    # 1. Ajouter les nouveaux modèles après TemplateCategory enum
    template_category_pos = schema_content.find('enum TemplateCategory {')
    if template_category_pos > 0:
        end_pos = schema_content.find('}', template_category_pos) + 1
        schema_content = schema_content[:end_pos] + '\n' + NEW_MODELS + '\n' + schema_content[end_pos:]
        print('✅ Nouveaux modèles ajoutés (SuperAdmin, Tenant, TenantUser)')
    
    print('\n📋 ÉTAPE 2: Modification des modèles existants...')
    # 2. Traiter chaque modèle individuellement
    for model_name in MODELS_TO_ADD_TENANT_ID:
        print(f'\n🔧 Traitement de {model_name}...')
        
        # Pattern pour capturer le modèle complet
        pattern = rf'(model {model_name} \{{.*?\n\}})'
        matches = list(re.finditer(pattern, schema_content, re.DOTALL))
        
        if not matches:
            print(f'❌ Modèle {model_name} non trouvé')
            continue
        
        if len(matches) > 1:
            print(f'⚠️  ATTENTION: {len(matches)} occurrences de {model_name} trouvées')
        
        # Ne traiter que la PREMIÈRE occurrence
        match = matches[0]
        old_model = match.group(1)
        new_model = add_tenant_id_to_model_safe(old_model, model_name)
        
        # Remplacer UNIQUEMENT la première occurrence
        schema_content = schema_content[:match.start()] + new_model + schema_content[match.end():]
        print(f'✅ {model_name} modifié')
    
    print('\n📋 ÉTAPE 3: Modification de SiteTemplate...')
    # 3. Modifier SiteTemplate
    schema_content = re.sub(
        r'(model SiteTemplate \{.*?)(siteId\s+String\s+@default\("main"\)\s+@unique)',
        r'\1tenantId    String   @unique',
        schema_content,
        count=1,  # UNE SEULE FOIS
        flags=re.DOTALL
    )
    print('✅ SiteTemplate modifié (siteId → tenantId)')
    
    # Ajouter relation Tenant dans SiteTemplate
    schema_content = schema_content.replace(
        'model SiteTemplate {',
        'model SiteTemplate {\n  // MODIFIED: Multi-tenant architecture',
        1  # UNE SEULE FOIS
    )
    
    # Ajouter relation tenant dans SiteTemplate si elle n'existe pas
    sitetemplate_pattern = r'(model SiteTemplate \{.*?)(template\s+Template\s+@relation)'
    if re.search(sitetemplate_pattern, schema_content, re.DOTALL):
        schema_content = re.sub(
            sitetemplate_pattern,
            r'\1tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n  \2',
            schema_content,
            count=1,
            flags=re.DOTALL
        )
        print('✅ Relation Tenant ajoutée à SiteTemplate')
    
    print('\n📋 ÉTAPE 4: Modification de TemplateCustomization...')
    # 4. Modifier TemplateCustomization
    schema_content = re.sub(
        r'(model TemplateCustomization \{.*?)(siteId\s+String\s+@default\("main"\))',
        r'\1tenantId    String',
        schema_content,
        count=1,
        flags=re.DOTALL
    )
    
    schema_content = re.sub(
        r'@@unique\(\[templateId, siteId\]\)',
        r'@@unique([templateId, tenantId])',
        schema_content,
        count=1
    )
    print('✅ TemplateCustomization modifié (siteId → tenantId)')
    
    return schema_content

def main():
    schema_path = 'prisma/schema.prisma'
    output_path = 'prisma/schema-multi-tenant.prisma'
    
    print('🚀 Début de la transformation multi-tenant du schema Prisma (v2)...\n')
    
    # Lire le schema actuel
    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_content = f.read()
        print(f'✅ Schema lu ({len(schema_content)} caractères)')
    except Exception as e:
        print(f'❌ Erreur lecture schema: {e}')
        sys.exit(1)
    
    # Traiter le schema
    new_schema = process_schema_safe(schema_content)
    
    # Sauvegarder le nouveau schema
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(new_schema)
        print(f'\n✅ Nouveau schema créé: {output_path}')
        print(f'📊 Taille: {len(new_schema)} caractères')
        print(f'\n✨ SUCCÈS: Schema multi-tenant prêt !')
        print(f'\nPour appliquer:')
        print(f'  cp prisma/schema-multi-tenant.prisma prisma/schema.prisma')
        print(f'  npx prisma db push --accept-data-loss')
        print(f'  npx prisma generate')
    except Exception as e:
        print(f'❌ Erreur écriture schema: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()

