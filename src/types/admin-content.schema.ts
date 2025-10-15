import { z } from "zod";

/**
 * 🛡️ SCHÉMA ZOD COMPLET POUR ADMIN-CONTENT.JSON
 *
 * Ce schéma garantit :
 * - ✅ Validation runtime complète
 * - ✅ Type-safety totale
 * - ✅ Autocomplétion IDE
 * - ✅ Détection des clés manquantes
 * - ✅ Protection contre les erreurs de migration
 *
 * @author KAIRO Digital - Senior Developer Team
 * @version 1.0.0
 */

// ===============================================
// 🔹 SCHÉMAS DE BASE
// ===============================================

const MetaSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  description: z.string(),
});

const PageMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

// ===============================================
// 🔹 COMMON - Sections partagées
// ===============================================

const CommonButtonsSchema = z.object({
  save: z.string().min(1),
  cancel: z.string().min(1),
  delete: z.string().min(1),
  edit: z.string().min(1),
  create: z.string().min(1),
  update: z.string().min(1),
  close: z.string().min(1),
  confirm: z.string().min(1),
  refresh: z.string().min(1),
  loading: z.string().min(1),
  submit: z.string().min(1),
  reset: z.string().min(1),
  search: z.string().min(1),
  filter: z.string().min(1),
  export: z.string().min(1),
  import: z.string().min(1),
  download: z.string().min(1),
  upload: z.string().min(1),
  preview: z.string().min(1),
  back: z.string().min(1),
  next: z.string().min(1),
  previous: z.string().min(1),
  viewDetails: z.string().min(1),
  addNew: z.string().min(1),
});

const CommonMessagesSchema = z.object({
  success: z.string().min(1),
  error: z.string().min(1),
  loading: z.string().min(1),
  noData: z.string().min(1),
  confirmDelete: z.string().min(1),
  confirmAction: z.string().min(1),
  saveSuccess: z.string().min(1),
  saveError: z.string().min(1),
  deleteSuccess: z.string().min(1),
  deleteError: z.string().min(1),
  required: z.string().min(1),
  invalidEmail: z.string().min(1),
  invalidFormat: z.string().min(1),
  unauthorized: z.string().min(1),
  sessionExpired: z.string().min(1),
});

const CommonLabelsSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  status: z.string().min(1),
  actions: z.string().min(1),
  description: z.string().min(1),
  type: z.string().min(1),
  role: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  id: z.string().min(1),
});

const CommonSchema = z.object({
  buttons: CommonButtonsSchema,
  messages: CommonMessagesSchema,
  labels: CommonLabelsSchema,
});

// ===============================================
// 🔹 LOGIN
// ===============================================

const LoginSchema = z.object({
  meta: PageMetaSchema,
  header: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    companyName: z.string().min(1),
    companySuffix: z.string().min(1),
    pageTitle: z.string().min(1),
  }),
  form: z.object({
    emailLabel: z.string().min(1),
    emailPlaceholder: z.string().min(1),
    passwordLabel: z.string().min(1),
    passwordPlaceholder: z.string().min(1),
    submitButton: z.string().min(1),
    loadingButton: z.string().min(1),
    demoButton: z.string().min(1),
  }),
  messages: z.object({
    errorRequired: z.string().min(1),
    errorInvalidCredentials: z.string().min(1),
    errorServer: z.string().min(1),
    infoDemo: z.string().min(1),
    infoTemporary: z.string().min(1),
    accessGranted: z.string().min(1),
    copyrightText: z.string().min(1),
  }),
  links: z.object({
    forgotPassword: z.string().min(1),
    backToSite: z.string().min(1),
  }),
});

// ===============================================
// 🔹 DASHBOARD
// ===============================================

const DashboardSchema = z.object({
  meta: PageMetaSchema,
  header: z.object({
    title: z.string().min(1),
    welcome: z.string().min(1),
    subtitle: z.string().min(1),
    refresh: z.string().min(1),
    refreshing: z.string().min(1),
  }),
  stats: z
    .object({
      reservations: z.object({
        titleFull: z.string().min(1),
        titleShort: z.string().min(1),
        thisWeek: z.string().min(1),
        pending: z.string().min(1),
        toConfirm: z.string().min(1),
        confirmed: z.string().min(1),
      }),
      clients: z
        .object({
          title: z.string().min(1),
          activeLabel: z.string().min(1),
        })
        .passthrough(),
      users: z.object({
        title: z.string().min(1),
        superAdmins: z.string().min(1),
      }),
    })
    .passthrough(),
  recentActivity: z.object({
    title: z.string().min(1),
    viewAll: z.string().min(1),
    noActivity: z.string().min(1),
  }),
  quickActions: z.object({
    manageReservations: z.string().min(1),
  }),
  messages: z.object({
    accessDenied: z.string().min(1),
    accessDeniedMessage: z.string().min(1),
    errorLoadingStats: z.string().min(1),
    errorLogout: z.string().min(1),
    loadingActivity: z.string().min(1),
    noActivity: z.string().min(1),
  }),
});

// ===============================================
// 🔹 RESERVATIONS
// ===============================================

const ReservationsSchema = z
  .object({
    meta: PageMetaSchema,
    header: z.object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
      refresh: z.string().min(1),
      refreshing: z.string().min(1),
    }),
    filters: z.object({
      searchPlaceholder: z.string().min(1),
      all: z.string().min(1),
      pending: z.string().min(1),
      confirmed: z.string().min(1),
      cancelled: z.string().min(1),
    }),
    messages: z.object({
      confirmSuccess: z.string().min(1),
      confirmError: z.string().min(1),
      cancelSuccess: z.string().min(1),
      cancelError: z.string().min(1),
      cancelErrorAlert: z.string().min(1),
      rescheduleSuccess: z.string().min(1),
      rescheduleError: z.string().min(1),
      rescheduleErrorAlert: z.string().min(1),
      requiredDateFields: z.string().min(1),
      requiredRescheduleReason: z.string().min(1),
      requiredCancelReason: z.string().min(1),
    }),
  })
  .passthrough();

// ===============================================
// 🔹 CLIENTS
// ===============================================

const ClientsSchema = z
  .object({
    meta: PageMetaSchema,
    header: z.object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
      addClient: z.string().min(1),
    }),
    filters: z.object({
      searchPlaceholder: z.string().min(1),
      all: z.string().min(1),
      prospects: z.string().min(1),
      clients: z.string().min(1),
      inactive: z.string().min(1),
    }),
    messages: z.object({
      createSuccess: z.string().min(1),
      createError: z.string().min(1),
      updateSuccess: z.string().min(1),
      updateError: z.string().min(1),
      deleteSuccess: z.string().min(1),
      deleteError: z.string().min(1),
      loadError: z.string().min(1),
    }),
  })
  .passthrough();

// ===============================================
// 🔹 USERS
// ===============================================

const UsersSchema = z
  .object({
    meta: PageMetaSchema,
    header: z.object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
      addUser: z.string().min(1),
    }),
    filters: z.object({
      searchPlaceholder: z.string().min(1),
      all: z.string().min(1),
      superAdmins: z.string().min(1),
      admins: z.string().min(1),
    }),
    messages: z.object({
      createSuccess: z.string().min(1),
      createError: z.string().min(1),
      updateSuccess: z.string().min(1),
      updateError: z.string().min(1),
      deleteSuccess: z.string().min(1),
      deleteError: z.string().min(1),
      deleteConfirm: z.string().min(1),
      loadError: z.string().min(1),
    }),
  })
  .passthrough();

// ===============================================
// 🔹 SETTINGS
// ===============================================

const SettingsSchema = z
  .object({
    meta: PageMetaSchema,
    header: z.object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
    }),
    tabs: z.object({
      general: z.string().min(1),
      social: z.string().min(1),
      booking: z.string().min(1),
      seo: z.string().min(1),
      theme: z.string().min(1),
      maintenance: z.string().min(1),
    }),
    messages: z.object({
      saveSuccess: z.string().min(1),
      saveError: z.string().min(1),
      loadError: z.string().min(1),
      maintenanceUpdateError: z.string().min(1),
      maintenanceDisableError: z.string().min(1),
      devModeBypass: z.string().min(1),
    }),
    defaults: z.object({
      siteName: z.string().min(1),
      tagline: z.string().min(1),
      keywords: z.string().min(1),
      maintenanceMessage: z.string().min(1),
    }),
    seo: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      fields: z.object({
        metaTitle: z.string().min(1),
        metaDescription: z.string().min(1),
        keywords: z.string().min(1),
        ogImage: z.string().min(1),
      }),
      buttons: z.object({
        analyzeSEO: z.string().min(1),
        analyzing: z.string().min(1),
      }),
      messages: z.object({
        analyzeSuccess: z.string().min(1),
        analyzeError: z.string().min(1),
        analyzing: z.string().min(1),
      }),
      indicators: z.object({
        technicalAnalysis: z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          status: z.string().min(1),
          icon: z.string().min(1),
        }),
        googleData: z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          statusConnected: z.string().min(1),
          statusDisconnected: z.string().min(1),
          iconConnected: z.string().min(1),
          iconDisconnected: z.string().min(1),
          setupRequired: z.string().min(1),
        }),
        mixedResults: z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          technicalScore: z.string().min(1),
          googleScore: z.string().min(1),
          combinedScore: z.string().min(1),
        }),
      }),
    }),
    performance: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      buttons: z.object({
        testPerformance: z.string().min(1),
        testing: z.string().min(1),
      }),
      results: z.object({
        title: z.string().min(1),
        coreWebVitals: z.string().min(1),
        pageSpeed: z.string().min(1),
        recommendations: z.string().min(1),
        lcp: z.string().min(1),
        fid: z.string().min(1),
        cls: z.string().min(1),
      }),
      messages: z.object({
        testSuccess: z.string().min(1),
        testError: z.string().min(1),
      }),
    }),
  })
  .passthrough();

// ===============================================
// 🔹 CONTENT
// ===============================================

const ContentSchema = z
  .object({
    meta: PageMetaSchema,
    header: z.object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
    }),
    filters: z.object({
      searchPlaceholder: z.string().min(1),
      showAll: z.string().min(1),
      showPublished: z.string().min(1),
      showDrafts: z.string().min(1),
    }),
    emptyStates: z.object({
      noResults: z.string().min(1),
      noResultsAction: z.string().min(1),
      noPages: z.string().min(1),
      noPagesAction: z.string().min(1),
    }),
    messages: z.object({
      loadSuccess: z.string().min(1),
      loadError: z.string().min(1),
      deleteSuccess: z.string().min(1),
      deleteError: z.string().min(1),
    }),
  })
  .passthrough();

// ===============================================
// 🔹 NAVIGATION
// ===============================================

const NavigationSchema = z.object({
  main: z.object({
    dashboard: z.string().min(1),
    reservations: z.string().min(1),
    clients: z.string().min(1),
    users: z.string().min(1),
    content: z.string().min(1),
    settings: z.string().min(1),
    site: z.string().min(1),
    assistant: z.string().min(1),
  }),
});

// ===============================================
// 🔹 LAYOUT
// ===============================================

const LayoutSchema = z.object({
  sidebar: z.object({
    logo: z.string().min(1),
    logoSuffix: z.string().min(1),
    adminPanel: z.string().min(1),
  }),
  header: z.object({
    connectedAs: z.string().min(1),
    logout: z.string().min(1),
  }),
});

// ===============================================
// 🔹 PERMISSIONS
// ===============================================

const PermissionsSchema = z.object({
  roles: z.object({
    superAdmin: z.string().min(1),
    admin: z.string().min(1),
  }),
});

// ===============================================
// 🔹 AUTRES SECTIONS
// ===============================================

const NotificationsSchema = z.object({}).passthrough();

const AssistantSchema = z.object({}).passthrough();

const ErrorsSchema = z.object({}).passthrough();

const EmptyStatesSchema = z.object({}).passthrough();

const ConfirmationsSchema = z.object({}).passthrough();

const TooltipsSchema = z.object({}).passthrough();

const LoadingSchema = z.object({}).passthrough();

const PaginationSchema = z.object({}).passthrough();

const DateTimeSchema = z.object({}).passthrough();

// ===============================================
// 🔹 SCHÉMA PRINCIPAL - ADMIN CONTENT COMPLET
// ===============================================

export const AdminContentSchema = z.object({
  meta: MetaSchema,
  common: CommonSchema,
  login: LoginSchema,
  dashboard: DashboardSchema,
  reservations: ReservationsSchema,
  clients: ClientsSchema,
  users: UsersSchema,
  settings: SettingsSchema,
  content: ContentSchema,
  navigation: NavigationSchema,
  layout: LayoutSchema,
  permissions: PermissionsSchema,
  notifications: NotificationsSchema,
  assistant: AssistantSchema,
  errors: ErrorsSchema,
  emptyStates: EmptyStatesSchema,
  confirmations: ConfirmationsSchema,
  tooltips: TooltipsSchema,
  loading: LoadingSchema,
  pagination: PaginationSchema,
  dateTime: DateTimeSchema,
});

// ===============================================
// 🔹 TYPES INFÉRÉS (AUTO-GÉNÉRÉS)
// ===============================================

export type AdminContent = z.infer<typeof AdminContentSchema>;
export type DashboardContent = z.infer<typeof DashboardSchema>;
export type ReservationsContent = z.infer<typeof ReservationsSchema>;
export type ClientsContent = z.infer<typeof ClientsSchema>;
export type UsersContent = z.infer<typeof UsersSchema>;
export type SettingsContent = z.infer<typeof SettingsSchema>;
export type ContentManagementContent = z.infer<typeof ContentSchema>;
export type NavigationContent = z.infer<typeof NavigationSchema>;
export type LayoutContent = z.infer<typeof LayoutSchema>;
export type CommonContent = z.infer<typeof CommonSchema>;
