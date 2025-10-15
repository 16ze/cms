"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBookingSettings } from "@/hooks/use-booking-settings";
import {
  Check,
  Clock,
  CalendarRange,
  User,
  Mail,
  Phone,
  MessageSquare,
  Video,
  ChevronLeft,
  ArrowRight,
  X,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarAlternate } from "@/components/ui/calendar-alternate";
import contentData from "@/config/content.json";

// Types pour le formulaire
type FormData = {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  projectDescription: string;
  communicationMethod: "VISIO" | "PHONE";
  reservationType: "DISCOVERY" | "CONSULTATION" | "PRESENTATION" | "FOLLOWUP";
  startTime: Date;
  endTime: Date;
};

// États du formulaire de réservation
enum BookingStep {
  SELECT_DATE = 0,
  SELECT_TIME = 1,
  FILL_DETAILS = 2,
  CONFIRMATION = 3,
}

// Mapping des icônes pour les types de réservation (défini en dehors du composant - stable)
const getReservationIcon = (id: string) => {
  switch (id) {
    case "DISCOVERY":
      return <MessageSquare className="w-4 h-4" />;
    case "CONSULTATION":
      return <Monitor className="w-4 h-4" />;
    case "PRESENTATION":
      return <User className="w-4 h-4" />;
    case "FOLLOWUP":
      return <CalendarRange className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
};

export default function BookingForm() {
  // Import direct du JSON - À l'intérieur du composant pour éviter les re-renders
  const bookingContent = contentData.consultation.bookingForm;

  // Types de réservation depuis le JSON - Mémorisés pour éviter les re-renders
  const reservationTypes = useMemo(
    () =>
      bookingContent.reservationTypes.map((type) => ({
        ...type,
        icon: getReservationIcon(type.id),
      })),
    [bookingContent.reservationTypes]
  );

  // Récupérer les paramètres de réservation synchronisés
  const { settings: bookingSettings, loading: settingsLoading } =
    useBookingSettings();

  // État pour suivre l'étape actuelle du formulaire
  const [step, setStep] = useState<BookingStep>(BookingStep.SELECT_DATE);

  // État pour stocker la date sélectionnée
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // État pour stocker le créneau sélectionné
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  // État pour stocker les créneaux disponibles
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    Array<{
      start: Date;
      end: Date;
    }>
  >([]);

  // État pour les jours disponibles dans le calendrier
  const [availableDays, setAvailableDays] = useState<Date[]>([]);

  // État pour gérer le chargement des données
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  // Initialisation de react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      communicationMethod: "VISIO",
      reservationType: "DISCOVERY",
    },
  });

  // Valeurs actuelles du formulaire
  const communicationMethod = watch("communicationMethod");
  const reservationType = watch("reservationType");

  // Fonction pour charger les jours disponibles (avec useCallback pour éviter les re-renders)
  const loadAvailableDays = useCallback(async () => {
    setIsCalendarLoading(true);
    try {
      // Génération des jours disponibles selon les paramètres de réservation
      const days: Date[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDays = bookingSettings.maxAdvanceBookingDays || 30;

      for (let i = 1; i <= maxDays; i++) {
        const date = addDays(today, i);
        const day = date.getDay();

        // Vérifier les réservations weekend selon les paramètres
        const isWeekend = day === 0 || day === 6;

        if (bookingSettings.allowWeekendBookings || !isWeekend) {
          days.push(date);
        }
      }

      setAvailableDays(days);
    } catch (error) {
      console.error("Erreur lors du chargement des jours disponibles:", error);
      toast.error(bookingContent?.errors?.loadingDaysError);
    } finally {
      setIsCalendarLoading(false);
    }
  }, [bookingSettings, bookingContent?.errors?.loadingDaysError]);

  // Effet pour charger les dates disponibles au chargement
  useEffect(() => {
    if (!settingsLoading) {
      loadAvailableDays();
    }
  }, [settingsLoading, loadAvailableDays]);

  // Afficher un indicateur de chargement si les paramètres ne sont pas encore chargés
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">
            {bookingContent?.loading?.settings}
          </p>
        </div>
      </div>
    );
  }

  // Fonction pour passer à l'étape suivante
  const nextStep = () => {
    setStep((prevStep) =>
      prevStep < BookingStep.CONFIRMATION ? prevStep + 1 : prevStep
    );
  };

  // Fonction pour revenir à l'étape précédente
  const prevStep = () => {
    setStep((prevStep) =>
      prevStep > BookingStep.SELECT_DATE ? prevStep - 1 : prevStep
    );
  };

  // Fonction pour charger les créneaux disponibles
  const loadAvailableTimeSlots = async (date: Date) => {
    setIsLoading(true);
    try {
      console.log(
        "🔍 Chargement des créneaux disponibles pour:",
        date.toDateString()
      );

      // Appeler l'API de disponibilité
      // Utiliser le fuseau horaire local pour éviter les décalages
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`; // Format YYYY-MM-DD en local
      console.log("📅 Date formatée pour l'API:", dateStr);

      const response = await fetch(`/api/booking/availability?date=${dateStr}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || "Erreur lors de la récupération des créneaux"
        );
      }

      console.log(
        `📅 ${data.availableSlots} créneau(x) disponible(s) trouvé(s)`
      );

      // Convertir les créneaux de l'API en format attendu par le composant
      const slots = data.slots.map((slot: any) => ({
        start: new Date(slot.start),
        end: new Date(slot.end),
      }));

      setAvailableTimeSlots(slots);

      // Afficher un message si aucun créneau n'est disponible
      if (slots.length === 0) {
        toast.info(bookingContent?.toast?.noSlotsAvailable);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des créneaux:", error);
      toast.error(bookingContent?.errors?.loadingSlotsError);
      setAvailableTimeSlots([]); // Vider les créneaux en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction appelée lors de la sélection d'une date
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      loadAvailableTimeSlots(date);
      nextStep();
    }
  };

  // Fonction appelée lors de la sélection d'un créneau
  const handleTimeSlotSelect = (slot: { start: Date; end: Date }) => {
    setSelectedTimeSlot(slot);
    setValue("startTime", slot.start);
    setValue("endTime", slot.end);
    nextStep();
  };

  // Fonction appelée lors de la soumission du formulaire
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (!selectedTimeSlot) {
        throw new Error(bookingContent?.errors?.noSlotSelected);
      }

      // En environnement de développement, on peut utiliser une adresse email de test
      const clientEmail =
        process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_TEST_EMAIL
          ? process.env.NEXT_PUBLIC_TEST_EMAIL
          : data.clientEmail;

      // Combiner les données du formulaire avec le créneau sélectionné
      const formData = {
        ...data,
        clientEmail,
        startTime: selectedTimeSlot.start,
        endTime: selectedTimeSlot.end,
        userId: "admin-user-id", // À remplacer par l'ID réel de l'administrateur
        projectDescription:
          data.projectDescription || "Pas de description fournie",
      };

      // Appel à l'API pour créer la réservation
      console.log("Envoi des données à l'API:", formData);

      // Première étape : création de la réservation
      let reservation;
      try {
        // Utiliser un chemin relatif en priorité, sauf si on est en environnement cross-origin
        const apiUrl = "/api/booking/reservation";

        console.log("URL de l'API utilisée:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        console.log("Statut de la réponse:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Texte de l'erreur:", errorText);

          let errorData;
          try {
            errorData = JSON.parse(errorText);
            throw new Error(errorData.error || "Erreur lors de la réservation");
          } catch (parseError) {
            console.error("Erreur lors du parsing JSON:", parseError);
            throw new Error(
              `Erreur serveur: ${response.status} ${response.statusText}`
            );
          }
        }

        reservation = await response.json();
        console.log("Réservation créée avec succès:", reservation);
      } catch (error) {
        console.error("Erreur lors de la création de la réservation:", error);
        throw error;
      }

      // La réservation a été créée avec succès dans la base de données
      // Même si des erreurs se produisent avec les emails, la réservation existe

      // Réinitialiser le formulaire
      reset();

      // Passer à l'étape de confirmation
      nextStep();

      // Afficher un toast de succès
      toast.success(bookingContent?.toast?.success);
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      toast.error(
        error instanceof Error
          ? `Erreur: ${error.message}`
          : bookingContent?.errors?.bookingError
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour formater l'heure
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour désactiver certaines dates dans le calendrier
  const disabledDays = (date: Date) => {
    // Désactiver les dates passées
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Désactiver les week-ends (6 = samedi, 0 = dimanche)
    const day = date.getDay();

    return date < today || day === 0 || day === 6;
  };

  // Fonction pour réinitialiser et démarrer une nouvelle réservation
  const resetBookingForm = () => {
    setStep(BookingStep.SELECT_DATE);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    reset();
  };

  // Rendu du titre de l'étape actuelle
  const renderStepTitle = () => {
    switch (step) {
      case BookingStep.SELECT_DATE:
        return bookingContent?.steps?.selectDate;
      case BookingStep.SELECT_TIME:
        return bookingContent?.steps?.selectTime;
      case BookingStep.FILL_DETAILS:
        return bookingContent?.steps?.fillDetails;
      case BookingStep.CONFIRMATION:
        return bookingContent?.steps?.confirmation;
      default:
        return "";
    }
  };

  // Rendu de l'indicateur de progression
  const renderProgressIndicator = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors",
                step === index
                  ? "bg-blue-600 text-white"
                  : step > index
                  ? "bg-green-600 text-white"
                  : "bg-neutral-200 text-neutral-600"
              )}
            >
              {step > index ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < 3 && (
              <div
                className={cn(
                  "h-0.5 w-8 md:w-16",
                  step > index ? "bg-green-600" : "bg-neutral-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Rendu conditionnel en fonction de l'étape
  const renderStep = () => {
    switch (step) {
      case BookingStep.SELECT_DATE:
        return (
          <div className="space-y-6">
            <p className="text-neutral-600 text-center">
              {bookingContent?.instructions?.selectDate}
            </p>
            <div className="flex justify-center max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
              <CalendarAlternate
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                enabledDays={availableDays}
                isFetching={isCalendarLoading}
                className="rounded-md"
                fullWidth
              />
            </div>
          </div>
        );

      case BookingStep.SELECT_TIME:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="mr-2 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />{" "}
                {bookingContent?.buttons?.back}
              </Button>
              <h3 className="text-lg font-medium text-neutral-900">
                {selectedDate?.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : availableTimeSlots.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600 mb-2">
                  {bookingContent?.instructions?.noSlots}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setStep(BookingStep.SELECT_DATE)}
                >
                  {bookingContent?.instructions?.chooseAnotherDate}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-start mb-4">
                  <p className="text-sm text-neutral-500 mb-2">
                    <Clock className="inline-block h-4 w-4 mr-1 align-text-bottom" />
                    {bookingContent?.instructions?.duration}{" "}
                    <span className="font-medium">
                      {bookingSettings.bookingTimeSlotMinutes} minutes
                    </span>
                  </p>
                  <p className="text-sm text-neutral-500">
                    {bookingContent?.instructions?.selectTime}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableTimeSlots.map((slot, index) => {
                    const startTime = formatTime(slot.start);
                    const isSelected =
                      selectedTimeSlot &&
                      selectedTimeSlot.start.getTime() === slot.start.getTime();

                    return (
                      <button
                        key={index}
                        onClick={() => handleTimeSlotSelect(slot)}
                        className={cn(
                          "py-3 px-2 text-sm font-medium rounded-md transition-colors border",
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-neutral-200 hover:border-blue-400:border-blue-500 hover:bg-blue-50:bg-blue-900/20"
                        )}
                      >
                        {startTime}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case BookingStep.FILL_DETAILS:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="mr-2 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />{" "}
                {bookingContent?.buttons?.back}
              </Button>

              <div className="flex-1">
                <div className="flex items-center text-sm text-blue-700 font-medium mb-1">
                  <CalendarRange className="h-4 w-4 mr-1" />
                  {selectedDate?.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {selectedTimeSlot && formatTime(selectedTimeSlot.start)}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(BookingStep.SELECT_DATE)}
                className="text-neutral-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Type de réservation */}
              <div className="space-y-3">
                <Label htmlFor="reservationType">
                  {bookingContent?.labels?.reservationType}
                </Label>
                <RadioGroup
                  defaultValue={reservationType}
                  onValueChange={(value: string) =>
                    setValue(
                      "reservationType",
                      value as
                        | "DISCOVERY"
                        | "CONSULTATION"
                        | "PRESENTATION"
                        | "FOLLOWUP"
                    )
                  }
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {reservationTypes.map((type) => (
                    <div key={type.id}>
                      <RadioGroupItem
                        value={type.id}
                        id={`type-${type.id}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`type-${type.id}`}
                        className="flex items-start p-3 border border-neutral-200 rounded-md cursor-pointer transition-colors hover:bg-neutral-50:bg-neutral-800 peer-data-[state=checked]:border-blue-500:border-blue-500 peer-data-[state=checked]:bg-blue-50:bg-blue-900/20"
                      >
                        <div className="h-5 w-5 mr-3 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                          {type.icon}
                        </div>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-neutral-600">
                            {type.description}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Méthode de communication */}
              <div className="space-y-3">
                <Label htmlFor="communicationMethod">
                  {bookingContent?.labels?.communicationMethod}
                </Label>
                <RadioGroup
                  defaultValue={communicationMethod}
                  onValueChange={(value: string) =>
                    setValue("communicationMethod", value as "VISIO" | "PHONE")
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center">
                    <RadioGroupItem
                      value="VISIO"
                      id="cm-visio"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="cm-visio"
                      className="flex items-center gap-2 py-2 px-3 border border-neutral-200 rounded-md cursor-pointer transition-colors hover:bg-neutral-50:bg-neutral-800 peer-data-[state=checked]:border-blue-500:border-blue-500 peer-data-[state=checked]:bg-blue-50:bg-blue-900/20"
                    >
                      <Video className="h-4 w-4 text-blue-600" />
                      <span>{bookingContent?.labels?.visio}</span>
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem
                      value="PHONE"
                      id="cm-phone"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="cm-phone"
                      className="flex items-center gap-2 py-2 px-3 border border-neutral-200 rounded-md cursor-pointer transition-colors hover:bg-neutral-50:bg-neutral-800 peer-data-[state=checked]:border-blue-500:border-blue-500 peer-data-[state=checked]:bg-blue-50:bg-blue-900/20"
                    >
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span>{bookingContent?.labels?.phone}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Informations personnelles */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">
                    {bookingContent?.labels?.name}{" "}
                    {bookingContent?.labels?.required}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="clientName"
                      placeholder={bookingContent?.placeholders?.name}
                      className="pl-10"
                      {...register("clientName", {
                        required: bookingContent?.errors?.required,
                      })}
                    />
                  </div>
                  {errors.clientName && (
                    <p className="text-sm text-red-500">
                      {errors.clientName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail">
                    {bookingContent?.labels?.email}{" "}
                    {bookingContent?.labels?.required}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder={bookingContent?.placeholders?.email}
                      className="pl-10"
                      {...register("clientEmail", {
                        required: bookingContent?.errors?.required,
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: bookingContent?.errors?.invalidEmail,
                        },
                      })}
                    />
                  </div>
                  {errors.clientEmail && (
                    <p className="text-sm text-red-500">
                      {errors.clientEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientPhone">
                    {bookingContent?.labels?.phoneNumber}{" "}
                    {communicationMethod === "PHONE" &&
                      bookingContent?.labels?.required}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="clientPhone"
                      placeholder={bookingContent?.placeholders?.phone}
                      className="pl-10"
                      {...register("clientPhone", {
                        required:
                          communicationMethod === "PHONE"
                            ? bookingContent?.errors?.phoneRequired
                            : false,
                      })}
                    />
                  </div>
                  {errors.clientPhone && (
                    <p className="text-sm text-red-500">
                      {errors.clientPhone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription">
                    {bookingContent?.labels?.projectDescription}{" "}
                    {bookingContent?.labels?.required}
                  </Label>
                  <Textarea
                    id="projectDescription"
                    placeholder={
                      bookingContent?.placeholders?.projectDescription
                    }
                    rows={4}
                    {...register("projectDescription", {
                      required: bookingContent?.errors?.required,
                      minLength: {
                        value: 20,
                        message: bookingContent?.errors?.minLength,
                      },
                    })}
                  />
                  {errors.projectDescription && (
                    <p className="text-sm text-red-500">
                      {errors.projectDescription.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>{bookingContent?.buttons?.submitting}</span>
                    </>
                  ) : (
                    <>
                      <span>{bookingContent?.buttons?.submit}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        );

      case BookingStep.CONFIRMATION:
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              {bookingContent?.confirmation?.title}
            </h3>
            <p className="text-neutral-600 mb-6">
              {bookingContent?.confirmation?.message}
            </p>

            <div className="max-w-md mx-auto bg-blue-50 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">
                    {selectedTimeSlot && formatTime(selectedTimeSlot.start)} -{" "}
                    {selectedTimeSlot && formatTime(selectedTimeSlot.end)}
                  </span>
                </div>
                {communicationMethod === "VISIO" ? (
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-blue-600" />
                    <span>{bookingContent?.confirmation?.visioMessage}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span>{bookingContent?.confirmation?.phoneMessage}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={resetBookingForm}
                className="flex items-center gap-2"
              >
                <CalendarRange className="h-4 w-4" />
                <span>{bookingContent?.buttons?.newBooking}</span>
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-full">
      {/* Titre de l'étape et indicateur de progression */}
      {step !== BookingStep.CONFIRMATION && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">
            {renderStepTitle()}
          </h3>
          {renderProgressIndicator()}
        </div>
      )}

      {/* Contenu de l'étape */}
      {renderStep()}
    </div>
  );
}
