import { prisma } from "@/lib/prisma";

export class TemplateService {
  // Récupérer tous les templates
  static async getTemplates() {
    return await prisma.template.findMany({
      where: { isActive: true },
      include: {
        pages: { orderBy: { orderIndex: 'asc' } },
        sidebarConfigs: { orderBy: { orderIndex: 'asc' } }
      },
      orderBy: { displayName: 'asc' }
    });
  }

  // Récupérer un template spécifique
  static async getTemplate(templateId: string) {
    return await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        pages: { orderBy: { orderIndex: 'asc' } },
        sidebarConfigs: { orderBy: { orderIndex: 'asc' } },
        customizations: true
      }
    });
  }

  // Récupérer le template actif
  static async getActiveTemplate() {
    const siteTemplate = await prisma.siteTemplate.findUnique({
      where: { siteId: 'main' },
      include: {
        template: {
          include: {
            pages: { orderBy: { orderIndex: 'asc' } },
            sidebarConfigs: { orderBy: { orderIndex: 'asc' } },
            customizations: true
          }
        }
      }
    });
    return siteTemplate?.template || null;
  }

  // Activer un template
  static async activateTemplate(templateId: string) {
    const existingSite = await prisma.siteTemplate.findUnique({
      where: { siteId: 'main' }
    });

    if (existingSite) {
      return await prisma.siteTemplate.update({
        where: { siteId: 'main' },
        data: { templateId, activatedAt: new Date() }
      });
    } else {
      return await prisma.siteTemplate.create({
        data: { siteId: 'main', templateId }
      });
    }
  }

  // CRITIQUE : Retourne SEULEMENT les éléments template, pas les universels
  static async getSidebarElements(templateId: string) {
    const templateSpecific = await prisma.templateSidebarConfig.findMany({
      where: { templateId },
      orderBy: { orderIndex: 'asc' }
    });

    return templateSpecific.map(item => ({
      id: item.elementId,
      elementId: item.elementId, // Garder elementId pour compatibilité
      label: item.label,
      icon: item.icon,
      href: item.href,
      orderIndex: item.orderIndex,
      category: item.category,
      // ✅ FIX: Autoriser tous les rôles, pas seulement super_admin
      requiredRoles: ["admin", "super_admin"] as const
    }));
  }

  // Récupérer la personnalisation
  static async getCustomization(templateId: string) {
    return await prisma.templateCustomization.findUnique({
      where: { templateId_siteId: { templateId, siteId: 'main' } }
    });
  }

  // Sauvegarder la personnalisation
  static async saveCustomization(templateId: string, data: any) {
    return await prisma.templateCustomization.upsert({
      where: { templateId_siteId: { templateId, siteId: 'main' } },
      update: data,
      create: { templateId, siteId: 'main', ...data }
    });
  }
}
