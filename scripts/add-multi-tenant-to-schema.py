#!/usr/bin/env python3
"""
Script pour ajouter l'architecture multi-tenant au schema Prisma
Auteur: KAIRO Digital
Date: 23 Octobre 2025
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

def add_tenant_id_to_model(model_content, model_name):
    """Ajoute tenantId à un modèle"""
    lines = model_content.split('\n')
    result = []
    
    # Trouver où insérer tenantId (après l'id)
    inserted = False
    for line in lines:
        result.append(line)
        if '  id ' in line and '@id' in line and not inserted:
            result.append('  tenantId    String')
            inserted = True
    
    # Ajouter la relation avant les @@index
    final_result = []
    for i, line in enumerate(result):
        if line.strip().startswith('@@index') and '  tenant ' not in '\n'.join(result):
            # Insérer la relation juste avant le premier @@index
            final_result.append('  ')
            final_result.append(f'  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)')
            final_result.append('  ')
        final_result.append(line)
        
    # Ajouter l'index tenantId après les autres index
    if '@@index([tenantId])' not in '\n'.join(final_result):
        # Trouver le dernier @@index
        last_index_pos = -1
        for i, line in enumerate(final_result):
            if '@@index' in line:
                last_index_pos = i
        
        if last_index_pos >= 0:
            final_result.insert(last_index_pos + 1, '  @@index([tenantId])')
    
    return '\n'.join(final_result)

def process_schema(schema_content):
    """Traite le schema complet"""
    
    # 1. Ajouter les nouveaux modèles après TemplateCategory enum
    template_category_pos = schema_content.find('enum TemplateCategory {')
    if template_category_pos > 0:
        # Trouver la fin de l'enum
        end_pos = schema_content.find('}', template_category_pos) + 1
        # Insérer les nouveaux modèles
        schema_content = schema_content[:end_pos] + '\n' + NEW_MODELS + '\n' + schema_content[end_pos:]
    
    # 2. Ajouter tenantId aux modèles concernés
    for model_name in MODELS_TO_ADD_TENANT_ID:
        # Trouver le modèle
        pattern = rf'model {model_name} {{\n(.*?\n)}}\n'
        match = re.search(pattern, schema_content, re.DOTALL)
        
        if match:
            old_model = match.group(0)
            new_model = add_tenant_id_to_model(old_model, model_name)
            schema_content = schema_content.replace(old_model, new_model)
            print(f'✅ Ajouté tenantId à {model_name}')
        else:
            print(f'⚠️  Modèle {model_name} non trouvé')
    
    # 3. Modifier SiteTemplate pour ajouter tenantId
    schema_content = re.sub(
        r'model SiteTemplate \{(.*?)siteId      String   @default\("main"\) @unique',
        r'model SiteTemplate {\1tenantId    String   @unique',
        schema_content,
        flags=re.DOTALL
    )
    
    # 4. Ajouter relation Tenant dans SiteTemplate
    schema_content = schema_content.replace(
        'model SiteTemplate {',
        'model SiteTemplate {\n  // MODIFIED: Uses tenantId instead of siteId'
    )
    
    # 5. Modifier TemplateCustomization
    schema_content = re.sub(
        r'model TemplateCustomization \{(.*?)templateId  String\n  siteId      String   @default\("main"\)',
        r'model TemplateCustomization {\1templateId  String\n  tenantId    String',
        schema_content,
        flags=re.DOTALL
    )
    
    schema_content = re.sub(
        r'@@unique\(\[templateId, siteId\]\)',
        r'@@unique([templateId, tenantId])',
        schema_content
    )
    
    return schema_content

def main():
    schema_path = 'prisma/schema.prisma'
    output_path = 'prisma/schema-multi-tenant.prisma'
    
    print('🚀 Début de la transformation multi-tenant du schema Prisma...\n')
    
    # Lire le schema actuel
    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_content = f.read()
        print(f'✅ Schema lu ({len(schema_content)} caractères)\n')
    except Exception as e:
        print(f'❌ Erreur lecture schema: {e}')
        sys.exit(1)
    
    # Traiter le schema
    new_schema = process_schema(schema_content)
    
    # Sauvegarder le nouveau schema
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(new_schema)
        print(f'\n✅ Nouveau schema créé: {output_path}')
        print(f'📊 Taille: {len(new_schema)} caractères')
        print(f'\n⚠️  ATTENTION: Vérifiez le fichier avant de remplacer l\'original !')
        print(f'\nPour appliquer:')
        print(f'  cp prisma/schema-multi-tenant.prisma prisma/schema.prisma')
        print(f'  npx prisma db push')
        print(f'  npx prisma generate')
    except Exception as e:
        print(f'❌ Erreur écriture schema: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()

