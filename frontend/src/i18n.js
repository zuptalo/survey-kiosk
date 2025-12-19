import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Home page
      "welcome": "Welcome",
      "take_survey": "Take a Survey",
      "admin_login": "Admin Login",

      // Survey list
      "available_surveys": "Available Surveys",
      "no_surveys": "No surveys available",
      "select_survey": "Select a survey to begin",

      // Survey form
      "select_options": "Select your options",
      "submit": "Submit",
      "please_select_option": "Please select at least one option",
      "thank_you": "Thank you!",
      "thank_you_message": "Your feedback has been recorded",
      "resetting_in": "Resetting in",
      "seconds": "seconds",
      "are_you_still_there": "Are you still there?",
      "inactivity_warning_message": "We noticed you haven't interacted with the survey. Do you need more time?",
      "continue_survey": "Continue Survey",

      // Admin
      "admin_dashboard": "Dashboard",
      "create_new_survey": "New Survey",
      "edit_survey": "Edit",
      "view_results": "Results",
      "delete_survey": "Delete",
      "duplicate_survey": "Duplicate",
      "reset_ratings": "Reset",
      "export_surveys": "Export",
      "import_surveys": "Import",
      "logout": "Logout",

      // Survey form
      "survey_title": "Survey Title",
      "survey_description": "Description",
      "items": "Items",
      "add_item": "Add Item",
      "item_text": "Item Text",
      "item_image": "Item Image",
      "remove_item": "Remove",
      "survey_must_have_item": "Survey must have at least one item",
      "save": "Save",
      "cancel": "Cancel",

      // Results
      "total_responses": "Total Responses",
      "total_questions": "Total Questions",
      "selection_count": "Selection Count",
      "percentage": "Percentage",
      "most_popular": "Most Popular",
      "most_popular_tied": "Most Popular (Tied)",
      "average_selections": "Average Selections per Response",
      "created_at": "Created",
      "first_response": "First Response",
      "results": "Results",
      "visual": "Visual",
      "no_responses_yet": "No responses yet",

      // Login
      "password": "Password",
      "login": "Login",
      "login_failed": "Login failed. Please check your password.",

      // Actions
      "confirm": "Confirm",
      "confirm_delete": "Delete Survey?",
      "confirm_reset": "Reset Ratings?",
      "reset_warning": "This will permanently delete all responses for this survey.",
      "confirm_duplicate": "Enter a name for the duplicated survey:",

      // Messages
      "loading": "Loading...",
      "error": "An error occurred",
      "success": "Success",
      "survey_created": "Survey created successfully",
      "survey_updated": "Survey updated successfully",
      "survey_deleted": "Survey deleted successfully",
      "ratings_reset": "Ratings reset successfully",
      "survey_duplicated": "Survey duplicated successfully",
      "surveys_exported": "Surveys exported successfully",
      "surveys_imported": "Surveys imported successfully",
      "import_failed": "Import failed",
      "select_import_file": "Select a backup file to import",
      "importing": "Importing...",

      // Form labels and fields
      "title_english": "Title (English)",
      "title_swedish": "Title (Swedish)",
      "description_english": "Description (English)",
      "description_swedish": "Description (Swedish)",
      "text_english": "Text (English)",
      "text_swedish": "Text (Swedish)",
      "required_field": "*",
      "remove_image": "Remove Image",
      "new_title_english": "New Title (English)",
      "new_title_swedish": "New Title (Swedish)",
      "enter_new_english_title": "Enter new English title",
      "enter_new_swedish_title": "Ange ny svensk titel",
      "english_title": "English title",
      "swedish_title": "Svensk titel",
      "english_description": "English description",
      "swedish_description": "Svensk beskrivning",
      "english_text": "English text",
      "swedish_text": "Svensk text",

      // Validation
      "at_least_one_title": "At least one title (EN or SV) is required",
      "at_least_one_item": "At least one item with text or image is required",
      "please_enter_title": "Please enter at least one title (English or Swedish)",
      "untitled_survey": "Untitled Survey",

      // Navigation
      "back_to_welcome": "Back to welcome",
      "back_to_surveys": "Back to surveys",
      "back_to_dashboard": "Back to Dashboard",

      // Survey form builder
      "survey_title_section": "Survey Title",
      "description_section": "Description",
      "item_number": "Item",
      "preview": "Preview",
      "surveys_count": "surveys",
      "question": "Question",
      "question_number": "Question",
      "add_question": "Add Question",
      "remove_question": "Remove Question",
      "question_text": "Question Text",
      "selection_mode": "Selection Mode",
      "single_select": "Single Select (Pick One)",
      "multiple_select": "Multiple Select (Pick Multiple)",
      "question_text_english": "Question Text (English)",
      "question_text_swedish": "Question Text (Swedish)",
      "next": "Next",
      "previous": "Previous",
      "of": "of",
    }
  },
  sv: {
    translation: {
      // Home page
      "welcome": "Välkommen",
      "take_survey": "Ta en undersökning",
      "admin_login": "Admin Inloggning",

      // Survey list
      "available_surveys": "Tillgängliga undersökningar",
      "no_surveys": "Inga undersökningar tillgängliga",
      "select_survey": "Välj en undersökning för att börja",

      // Survey form
      "select_options": "Välj dina alternativ",
      "submit": "Skicka",
      "please_select_option": "Vänligen välj minst ett alternativ",
      "thank_you": "Tack!",
      "thank_you_message": "Din feedback har registrerats",
      "resetting_in": "Återställs om",
      "seconds": "sekunder",
      "are_you_still_there": "Är du fortfarande där?",
      "inactivity_warning_message": "Vi märkte att du inte har interagerat med undersökningen. Behöver du mer tid?",
      "continue_survey": "Fortsätt undersökning",

      // Admin
      "admin_dashboard": "Dashboard",
      "create_new_survey": "Skapa ny",
      "edit_survey": "Redigera",
      "view_results": "Resultat",
      "delete_survey": "Ta bort",
      "duplicate_survey": "Duplicera",
      "reset_ratings": "Återställ",
      "export_surveys": "Exportera",
      "import_surveys": "Importera",
      "logout": "Logga ut",

      // Survey form
      "survey_title": "Undersökningens titel",
      "survey_description": "Beskrivning",
      "items": "Objekt",
      "add_item": "Lägg till objekt",
      "item_text": "Objekttext",
      "item_image": "Objektbild",
      "remove_item": "Ta bort",
      "survey_must_have_item": "Undersökning måste ha minst ett objekt",
      "save": "Spara",
      "cancel": "Avbryt",

      // Results
      "total_responses": "Totalt antal svar",
      "total_questions": "Totalt antal frågor",
      "selection_count": "Antal val",
      "percentage": "Procent",
      "most_popular": "Mest populära",
      "most_popular_tied": "Mest populära (Lika)",
      "average_selections": "Genomsnittligt antal val per svar",
      "created_at": "Skapad",
      "first_response": "Första svaret",
      "results": "Resultat",
      "visual": "Visuell",
      "no_responses_yet": "Inga svar ännu",

      // Login
      "password": "Lösenord",
      "login": "Logga in",
      "login_failed": "Inloggning misslyckades. Kontrollera ditt lösenord.",

      // Actions
      "confirm": "Bekräfta",
      "confirm_delete": "Ta bort undersökning?",
      "confirm_reset": "Återställ betyg?",
      "reset_warning": "Detta kommer permanent ta bort alla svar för denna undersökning.",
      "confirm_duplicate": "Ange ett namn för den duplicerade undersökningen:",

      // Messages
      "loading": "Laddar...",
      "error": "Ett fel uppstod",
      "success": "Framgång",
      "survey_created": "Undersökning skapad",
      "survey_updated": "Undersökning uppdaterad",
      "survey_deleted": "Undersökning borttagen",
      "ratings_reset": "Betyg återställda",
      "survey_duplicated": "Undersökning duplicerad",
      "surveys_exported": "Undersökningar exporterade",
      "surveys_imported": "Undersökningar importerade",
      "import_failed": "Import misslyckades",
      "select_import_file": "Välj en säkerhetskopieringsfil att importera",
      "importing": "Importerar...",

      // Form labels and fields
      "title_english": "Titel (Engelska)",
      "title_swedish": "Titel (Svenska)",
      "description_english": "Beskrivning (Engelska)",
      "description_swedish": "Beskrivning (Svenska)",
      "text_english": "Text (Engelska)",
      "text_swedish": "Text (Svenska)",
      "required_field": "*",
      "remove_image": "Ta bort bild",
      "new_title_english": "Ny titel (Engelska)",
      "new_title_swedish": "Ny titel (Svenska)",
      "enter_new_english_title": "Ange ny engelsk titel",
      "enter_new_swedish_title": "Ange ny svensk titel",
      "english_title": "Engelsk titel",
      "swedish_title": "Svensk titel",
      "english_description": "Engelsk beskrivning",
      "swedish_description": "Svensk beskrivning",
      "english_text": "Engelsk text",
      "swedish_text": "Svensk text",

      // Validation
      "at_least_one_title": "Minst en titel (EN eller SV) krävs",
      "at_least_one_item": "Minst ett objekt med text eller bild krävs",
      "please_enter_title": "Vänligen ange minst en titel (engelska eller svenska)",
      "untitled_survey": "Namnlös undersökning",

      // Navigation
      "back_to_welcome": "Tillbaka till välkommen",
      "back_to_surveys": "Tillbaka till undersökningar",
      "back_to_dashboard": "Tillbaka till kontrollpanel",

      // Survey form builder
      "survey_title_section": "Undersökningens titel",
      "description_section": "Beskrivning",
      "item_number": "Objekt",
      "preview": "Förhandsvisning",
      "surveys_count": "undersökningar",
      "question": "Fråga",
      "question_number": "Fråga",
      "add_question": "Lägg till fråga",
      "remove_question": "Ta bort fråga",
      "question_text": "Frågetext",
      "selection_mode": "Valläge",
      "single_select": "Enkelval (Välj en)",
      "multiple_select": "Flerval (Välj flera)",
      "question_text_english": "Frågetext (Engelska)",
      "question_text_swedish": "Frågetext (Svenska)",
      "next": "Nästa",
      "previous": "Föregående",
      "of": "av",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
