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
      "thank_you": "Thank you!",
      "thank_you_message": "Your feedback has been recorded",
      "resetting_in": "Resetting in",
      "seconds": "seconds",

      // Admin
      "admin_dashboard": "Admin Dashboard",
      "create_new_survey": "Create New Survey",
      "edit_survey": "Edit Survey",
      "view_results": "View Results",
      "delete_survey": "Delete Survey",
      "duplicate_survey": "Duplicate Survey",
      "reset_ratings": "Reset Ratings",
      "logout": "Logout",

      // Survey form
      "survey_title": "Survey Title",
      "survey_description": "Description",
      "items": "Items",
      "add_item": "Add Item",
      "item_text": "Item Text",
      "item_image": "Item Image",
      "remove_item": "Remove",
      "save": "Save",
      "cancel": "Cancel",

      // Results
      "total_responses": "Total Responses",
      "selection_count": "Selection Count",
      "percentage": "Percentage",
      "most_popular": "Most Popular",
      "average_selections": "Average Selections per Response",
      "created_at": "Created",
      "first_response": "First Response",

      // Login
      "password": "Password",
      "login": "Login",
      "login_failed": "Login failed. Please check your password.",

      // Actions
      "confirm": "Confirm",
      "confirm_delete": "Are you sure you want to delete this survey?",
      "confirm_reset": "Are you sure you want to reset all ratings for this survey?",
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
      "thank_you": "Tack!",
      "thank_you_message": "Din feedback har registrerats",
      "resetting_in": "Återställs om",
      "seconds": "sekunder",

      // Admin
      "admin_dashboard": "Admin Kontrollpanel",
      "create_new_survey": "Skapa ny undersökning",
      "edit_survey": "Redigera undersökning",
      "view_results": "Visa resultat",
      "delete_survey": "Ta bort undersökning",
      "duplicate_survey": "Duplicera undersökning",
      "reset_ratings": "Återställ betyg",
      "logout": "Logga ut",

      // Survey form
      "survey_title": "Undersökningens titel",
      "survey_description": "Beskrivning",
      "items": "Objekt",
      "add_item": "Lägg till objekt",
      "item_text": "Objekttext",
      "item_image": "Objektbild",
      "remove_item": "Ta bort",
      "save": "Spara",
      "cancel": "Avbryt",

      // Results
      "total_responses": "Totalt antal svar",
      "selection_count": "Antal val",
      "percentage": "Procent",
      "most_popular": "Mest populära",
      "average_selections": "Genomsnittligt antal val per svar",
      "created_at": "Skapad",
      "first_response": "Första svaret",

      // Login
      "password": "Lösenord",
      "login": "Logga in",
      "login_failed": "Inloggning misslyckades. Kontrollera ditt lösenord.",

      // Actions
      "confirm": "Bekräfta",
      "confirm_delete": "Är du säker på att du vill ta bort denna undersökning?",
      "confirm_reset": "Är du säker på att du vill återställa alla betyg för denna undersökning?",
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
