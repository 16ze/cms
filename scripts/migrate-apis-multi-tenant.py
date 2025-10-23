#!/usr/bin/env python3
"""
Script de migration automatique des APIs vers multi-tenant
Auteur: KAIRO Digital
Date: 23 Octobre 2025
"""

import os
import re
from pathlib import Path

# Liste des APIs à migrer
APIS_TO_MIGRATE = [
    # Corporate
    ("src/app/api/admin/projets/route.ts", "PROJETS CORPORATE"),
    ("src/app/api/admin/projets/[id]/route.ts", "PROJET INDIVIDUEL"),
    ("src/app/api/admin/equipe/route.ts", "ÉQUIPE"),
    ("src/app/api/admin/equipe/[id]/route.ts", "MEMBRE ÉQUIPE"),
    
    # E-commerce
    ("src/app/api/admin/produits/[id]/route.ts", "PRODUIT INDIVIDUEL"),
    ("src/app/api/admin/commandes/route.ts", "COMMANDES"),
    ("src/app/api/admin/commandes/[id]/route.ts", "COMMANDE INDIVIDUELLE"),
    
    # Blog
    ("src/app/api/admin/articles/route.ts", "ARTICLES"),
    ("src/app/api/admin/articles/[id]/route.ts", "ARTICLE INDIVIDUEL"),
    ("src/app/api/admin/categories/route.ts", "CATÉGORIES"),
    ("src/app/api/admin/auteurs/route.ts", "AUTEURS"),
    
    # Restaurant
    ("src/app/api/admin/menu/route.ts", "MENU"),
    ("src/app/api/admin/tables/route.ts", "TABLES"),
    
    # Bien-être
    ("src/app/api/admin/cours/route.ts", "COURS"),
    ("src/app/api/admin/coaches/route.ts", "COACHES"),
    
    # Consultation
    ("src/app/api/admin/patients/route.ts", "PATIENTS"),
    ("src/app/api/admin/therapeutes/route.ts", "THÉRAPEUTES"),
    
    # Services
    ("src/app/api/admin/devis/route.ts", "DEVIS"),
    ("src/app/api/admin/facturation/route.ts", "FACTURATION"),
    
    # Portfolio
    ("src/app/api/admin/galerie/route.ts", "GALERIE"),
]

def migrate_api_file(file_path, api_name):
    """Migre un fichier API vers multi-tenant"""
    
    if not os.path.exists(file_path):
        print(f"⚠️  {file_path} n'existe pas, skip")
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Vérifier si déjà migré
        if 'Multi-tenant ready ✅' in content or 'ensureAuthenticated' in content:
            print(f"✅ {file_path} déjà migré, skip")
            return True
        
        # Remplacer les imports
        content = re.sub(
            r'import \{ ensureAdmin \} from "@/lib/auth";',
            'import { ensureAuthenticated } from "@/lib/tenant-auth";\nimport { getTenantFilter, requireTenant, verifyTenantAccess } from "@/middleware/tenant-context";',
            content
        )
        
        # Ajouter header
        if '/**' not in content[:100]:
            header = f'''/**
 * API: {api_name}
 * {'=' * len(f'API: {api_name}')}
 * Multi-tenant ready ✅
 */

'''
            content = header + content
        
        # Remplacer ensureAdmin par ensureAuthenticated
        content = content.replace('ensureAdmin(request)', 'ensureAuthenticated(request)')
        
        # Ajouter getTenantFilter dans les GET
        # Pattern: après authResult, avant la requête Prisma
        if 'export async function GET' in content:
            # Trouver la position après authResult
            pattern = r'(const authResult = await ensureAuthenticated\(request\);\s+if \(authResult instanceof NextResponse\) return authResult;)'
            replacement = r'\1\n\n    // 🔒 Isolation multi-tenant\n    const { tenantFilter } = await getTenantFilter(request);'
            content = re.sub(pattern, replacement, content)
            
            # Ajouter tenantFilter dans les where
            # Remplacer "const where: any = {};" par "const where: any = { ...tenantFilter };"
            content = re.sub(
                r'const where: any = \{\};',
                r'const where: any = { ...tenantFilter }; // 🔒 ISOLATION',
                content
            )
            
            # Pour findMany sans where explicite, ajouter where: tenantFilter
            content = re.sub(
                r'\.findMany\(\{\s*orderBy',
                r'.findMany({\n      where: tenantFilter, // 🔒 ISOLATION\n      orderBy',
                content
            )
        
        # Ajouter requireTenant dans les POST
        if 'export async function POST' in content:
            pattern = r'(const authResult = await ensureAuthenticated\(request\);\s+if \(authResult instanceof NextResponse\) return authResult;)'
            replacement = r'\1\n\n    // 🔒 Récupérer le tenantId\n    const { tenantId } = await requireTenant(request);'
            content = re.sub(pattern, replacement, content)
            
            # Ajouter tenantId dans create
            # Remplacer "create({ data })" ou "create({ data: {...} })" par "create({ data: { ...data, tenantId } })"
            content = re.sub(
                r'\.create\(\{ data \}\)',
                r'.create({\n      data: {\n        ...data,\n        tenantId, // 🔒 ISOLATION\n      },\n    })',
                content
            )
            
            content = re.sub(
                r'\.create\(\{\s*data:',
                r'.create({\n      data: {\n        ...(',
                content
            )
        
        # Ajouter verifyTenantAccess dans PUT/DELETE
        if 'export async function PUT' in content or 'export async function DELETE' in content:
            # Ajouter vérification après authResult
            pattern = r'(const authResult = await ensureAuthenticated\(request\);\s+if \(authResult instanceof NextResponse\) return authResult;)'
            
            # Vérifier si params existe (route avec [id])
            if 'params' in content:
                replacement = r'''\1

    // 🔒 Vérifier l'accès au tenant
    const existing = await prisma.MODELNAME.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    const hasAccess = await verifyTenantAccess(request, existing.tenantId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }'''
                content = re.sub(pattern, replacement, content)
        
        # Remplacer les console.error
        content = re.sub(
            r'console\.error\("Erreur (GET|POST|PUT|DELETE)',
            r'console.error("❌ \1 ' + file_path.replace('src/app/', '/'),
            content
        )
        
        # Sauvegarder
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ {file_path} migré")
        return True
        
    except Exception as e:
        print(f"❌ Erreur migration {file_path}: {e}")
        return False

def main():
    print("🚀 Début de la migration automatique des APIs vers multi-tenant\n")
    
    total = len(APIS_TO_MIGRATE)
    success = 0
    skipped = 0
    failed = 0
    
    for file_path, api_name in APIS_TO_MIGRATE:
        print(f"\n📝 Migration de {api_name}...")
        result = migrate_api_file(file_path, api_name)
        
        if result is True:
            success += 1
        elif result is None:
            skipped += 1
        else:
            failed += 1
    
    print("\n" + "="*60)
    print("✨ MIGRATION TERMINÉE !")
    print(f"   Total: {total} APIs")
    print(f"   ✅ Succès: {success}")
    print(f"   ⚠️  Skippées: {skipped}")
    print(f"   ❌ Échecs: {failed}")
    print("="*60)
    
    if failed > 0:
        print("\n⚠️  Certaines APIs n'ont pas pu être migrées automatiquement.")
        print("   Vérifiez-les manuellement et appliquez le pattern.")

if __name__ == "__main__":
    main()

