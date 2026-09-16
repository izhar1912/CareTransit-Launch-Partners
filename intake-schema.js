/* ==========================================================================
   CareTransit Launch Partners — Client Intake questions
   --------------------------------------------------------------------------
   Every section and question on intake.html comes from this file.
   Keys are what gets saved; they must match INTAKE_FIELDS in Code.gs.
   If you add, remove or rename a question, update Code.gs too
   (see FORMS-SETUP.md → "Changing intake questions").

   Question types
     text · email · tel · textarea · select · address · states
     radio      options, pills: true for short Yes/No style rows
     checkbox   options, exclusive: ["None yet"] clears the others
     textOrNone text box with a "not yet" checkbox
     group      a set of sub-fields saved together
     repeater   add-another list (owners, facilities, contracts)
   showIf       { key, equals } | { key, includes } | { key, in: [...] }
   sub: true    shown as a follow-up of the question before it
   numbered     a follow-up that still counts as its own numbered question
   ========================================================================== */

(function () {
  const YN = ['Yes', 'No'];
  const STATES = (window.SITE && window.SITE.usStates) || [];

  window.INTAKE = {
    draftKey: 'ct-intake-draft-v1',
    doneKey: 'ct-intake-done',
    sections: [
      /* ------------------------------------------------------------ 1 */
      {
        id: 'about', title: 'About You',
        intro: 'Start with who you are and how you would like us to reach you.',
        questions: [
          { key: 'fullName', label: 'Full legal name', type: 'text', required: true, autocomplete: 'name' },
          { key: 'preferredName', label: 'Preferred name', type: 'text', autocomplete: 'nickname', hint: 'What should we call you?' },
          { key: 'email', label: 'Email address', type: 'email', required: true, autocomplete: 'email' },
          { key: 'phone', label: 'Mobile phone number', type: 'tel', required: true, autocomplete: 'tel' },
          { key: 'address', label: 'Current home/mailing address', type: 'address', required: true },
          { key: 'contactPreference', label: 'What is your preferred method of communication?', type: 'radio', pills: true,
            options: ['Phone', 'Text', 'Email'] },
          { key: 'hasCoOwners', label: 'Will anyone else own or have control of this business with you?', type: 'radio', pills: true, options: YN },
          { key: 'coOwners', label: 'Additional owners', type: 'repeater', sub: true, itemLabel: 'Owner',
            showIf: { key: 'hasCoOwners', equals: 'Yes' }, min: 1, max: 6, ownershipCheck: 'pct',
            fields: [
              { name: 'name', label: 'Full legal name', type: 'text', required: true },
              { name: 'title', label: 'Title/role', type: 'text', placeholder: 'e.g., Co-owner, Operations Manager' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'phone', label: 'Phone', type: 'tel' },
              { name: 'pct', label: 'Expected ownership %', type: 'number', required: true, min: 1, max: 99, suffix: '%' }
            ] }
        ]
      },

      /* ------------------------------------------------------------ 2 */
      {
        id: 'business', title: 'Your Business',
        intro: 'Tell us where the company stands today. “Not sure” is always a fine answer.',
        questions: [
          { key: 'stage', label: 'What stage are you currently in?', type: 'radio',
            options: ['Just researching', 'Ready to start', 'Business already formed', 'Business formed but not operational', 'Already operating and need help expanding'] },
          { key: 'legalBusinessName', label: 'What is your legal business name?', type: 'textOrNone', noneLabel: 'Not formed yet' },
          { key: 'hasDba', label: 'Do you have a DBA or trade name?', type: 'radio', pills: true, options: YN },
          { key: 'dbaName', label: 'Business/DBA name', type: 'text', sub: true, required: true, showIf: { key: 'hasDba', equals: 'Yes' } },
          { key: 'structure', label: 'How is the company structured?', type: 'radio',
            options: ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship', 'Not established yet', 'Not sure'] },
          { key: 'formationState', label: 'In what state is your company formed?', type: 'select',
            options: ['Not formed yet', 'Not sure'].concat(STATES) },
          { key: 'serviceStates', label: 'In what state(s) do you want to provide transportation services?', type: 'states', required: true,
            hint: 'Select all that apply. Choosing Illinois or New Jersey adds a short state-specific section.', popular: ['Illinois', 'New Jersey'] },
          { key: 'serviceArea', label: 'What city or county will be your primary service area?', type: 'text', placeholder: 'e.g., Cook County, IL' },
          { key: 'ein', label: 'Do you already have an EIN?', type: 'radio', pills: true,
            options: ['Yes', 'No', 'Application pending', 'Need CareTransit assistance'] },
          { key: 'bankAccount', label: 'Do you already have a business bank account?', type: 'radio', pills: true,
            options: ['Yes', 'No', 'In progress', 'Need assistance'] },
          { key: 'businessAddress', label: 'Do you have a business address?', type: 'radio', pills: true,
            options: ['Yes', 'No', 'Need assistance finding one'] },
          { key: 'locationType', label: 'What type of location will you operate from?', type: 'radio',
            options: ['Commercial office', 'Home office', 'Shared or virtual office', 'Transportation facility', 'Haven’t selected one', 'Other'] },
          { key: 'businessPhone', label: 'Do you have a dedicated business telephone number?', type: 'radio', pills: true, options: ['Yes', 'No', 'Need one'] },
          { key: 'businessEmail', label: 'Do you have a business email address?', type: 'radio', pills: true, options: ['Yes', 'No', 'Need one'] }
        ]
      },

      /* ------------------------------------------------------------ 3 */
      {
        id: 'model', title: 'Your Transportation Model',
        intro: 'The services and vehicles you plan to start with shape your whole launch path.',
        questions: [
          { key: 'serviceTypes', label: 'What type of medical transportation services do you want to provide?', type: 'checkbox', hint: 'Select all that apply.',
            options: ['Ambulatory/non-wheelchair', 'Wheelchair', 'Stretcher', 'Senior transportation', 'Dialysis transportation', 'Behavioral-health transportation', 'Hospital discharge transportation', 'Rehabilitation transportation', 'Adult-day-program transportation', 'Private-pay transportation', 'Other', 'Not sure'] },
          { key: 'startingModel', label: 'How would you like to begin?', type: 'radio',
            options: ['Ambulatory passengers only', 'Ambulatory + wheelchair', 'Wheelchair-focused', 'Multiple service levels', 'Not sure—need CareTransit recommendation'] },
          { key: 'vehicleCount', label: 'How many vehicles do you plan to start with?', type: 'radio', pills: true,
            options: ['1', '2', '3–5', 'More than 5', 'Not sure'] },
          { key: 'ownsVehicle', label: 'Do you currently own a vehicle you intend to use?', type: 'radio', pills: true, options: YN },
          { key: 'vehicle', label: 'Vehicle details', type: 'group', sub: true, showIf: { key: 'ownsVehicle', equals: 'Yes' },
            fields: [
              { name: 'year', label: 'Year', type: 'text', required: true, format: 'year', inputmode: 'numeric', placeholder: 'YYYY' },
              { name: 'make', label: 'Make', type: 'text', required: true, placeholder: 'e.g., Toyota' },
              { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., Sienna' },
              { name: 'mileage', label: 'Mileage', type: 'text', format: 'mileage', inputmode: 'numeric', placeholder: 'e.g., 42,000' },
              { name: 'ownership', label: 'Ownership status', type: 'select', options: ['Owned outright', 'Financed', 'Leased', 'Other'] },
              { name: 'vin6', label: 'VIN (last 6 digits)', type: 'text', format: 'vin6', maxlength: 6, placeholder: 'e.g., A12345' },
              { name: 'regState', label: 'Current registration state', type: 'select', options: STATES }
            ] },
          { key: 'vehiclePlan', label: 'If you do not have a vehicle, how do you plan to obtain one?', type: 'radio',
            showIf: { key: 'ownsVehicle', equals: 'No' },
            options: ['Purchase cash', 'Finance', 'Lease', 'Need CareTransit assistance sourcing and financing', 'Not sure'] },
          { key: 'vehicleBudget', label: 'What is your estimated vehicle budget?', type: 'radio',
            options: ['Under $15,000', '$15,000–$25,000', '$25,001–$40,000', '$40,001–$60,000', '$60,000+', 'Not determined'] },
          { key: 'wheelchairVehicle', label: 'Will you need a wheelchair-accessible vehicle?', type: 'radio', pills: true,
            options: ['Yes', 'No', 'Eventually', 'Not sure'] }
        ]
      },

      /* ------------------------------------------------------------ 4 */
      {
        id: 'insurance', title: 'Insurance',
        intro: 'Where your coverage stands today. We verify payer and state requirements before you bind anything.',
        questions: [
          { key: 'spokeWithAgent', label: 'Have you spoken with a commercial insurance agent yet?', type: 'radio', pills: true, options: YN },
          { key: 'autoInsurance', label: 'Do you currently have commercial automobile insurance for the business?', type: 'radio', pills: true, options: ['Yes', 'No', 'Quote pending'] },
          { key: 'liabilityInsurance', label: 'Do you currently have general liability insurance?', type: 'radio', pills: true, options: ['Yes', 'No', 'Quote pending'] },
          { key: 'workersComp', label: 'Do you currently have workers’ compensation coverage?', type: 'radio', pills: true,
            options: ['Yes', 'No', 'Not sure whether required', 'No employees yet'] },
          { key: 'insuranceHelp', label: 'Would you like CareTransit to assist you with insurance-readiness requirements and obtaining appropriate quotes?', type: 'radio', pills: true, options: YN }
        ]
      },

      /* ------------------------------------------------------------ 5 */
      {
        id: 'payer', title: 'NPI, Medicaid & Payer Readiness',
        intro: 'Enrollment and payer steps often take the longest, so we plan them early.',
        questions: [
          { key: 'hasNpi', label: 'Does your company currently have an organizational NPI (Type 2)?', type: 'radio', pills: true,
            options: ['Yes', 'No', 'Application submitted', 'Not sure'] },
          { key: 'orgNpi', label: 'Organization NPI', type: 'text', sub: true, required: true, format: 'npi', inputmode: 'numeric', maxlength: 10,
            placeholder: '10-digit NPI', showIf: { key: 'hasNpi', equals: 'Yes' } },
          { key: 'taxonomy', label: 'Have you selected your healthcare provider taxonomy code(s)?', type: 'radio', pills: true, options: ['Yes', 'No', 'Not sure'] },
          { key: 'revenueInterests', label: 'Which revenue opportunities are you interested in pursuing?', type: 'checkbox', hint: 'Select all that apply.',
            options: ['Private pay', 'Facility contracts', 'Medicaid opportunities', 'Medicaid managed-care opportunities', 'Transportation broker/network opportunities', 'Medicare Advantage transportation opportunities where available', 'Commercial health-plan opportunities where applicable', 'Workers’ compensation/case-management transportation', 'Government contracting', 'Other'] },
          { key: 'startedApplications', label: 'Have you already started any payer, Medicaid, broker, or transportation-network applications?', type: 'radio', pills: true, options: YN },
          { key: 'applications', label: 'Application details', type: 'group', sub: true, showIf: { key: 'startedApplications', equals: 'Yes' },
            fields: [
              { name: 'orgs', label: 'Which organizations?', type: 'textarea', required: true, full: true },
              { name: 'status', label: 'Application status', type: 'text' },
              { name: 'reference', label: 'Reference or provider number (if available)', type: 'text' },
              { name: 'blockers', label: 'What is currently preventing completion?', type: 'textarea', full: true }
            ] },
          { key: 'priorEnrollment', label: 'Have you previously been enrolled as a healthcare or transportation provider under another company?', type: 'radio', pills: true, options: YN }
        ]
      },

      /* ------------------------------------------------------------ 6 */
      {
        id: 'nj', title: 'New Jersey', badge: 'Because you selected New Jersey',
        intro: 'A few questions specific to launching in New Jersey.',
        showIf: { key: 'serviceStates', includes: 'New Jersey' },
        questions: [
          { key: 'njFamilyCare', label: 'Are you interested in pursuing NJ FamilyCare/Medicaid-related transportation opportunities?', type: 'radio', pills: true, options: ['Yes', 'No', 'Not sure'] },
          { key: 'njBrokerContact', label: 'Have you started communicating with a New Jersey transportation broker/network or health plan?', type: 'radio', pills: true, options: YN },
          { key: 'njBrokerStatus', label: 'Which organization(s) have you contacted and what is the current status?', type: 'textarea', sub: true, numbered: true,
            showIf: { key: 'njBrokerContact', equals: 'Yes' } },
          { key: 'njCounties', label: 'Which New Jersey counties do you plan to serve?', type: 'textarea', placeholder: 'e.g., Essex, Hudson, Union' },
          { key: 'njFacilitiesInterested', label: 'Do you currently have any New Jersey facilities interested in using your transportation company?', type: 'radio', pills: true, options: YN },
          { key: 'njFacilities', label: 'Interested facilities', type: 'repeater', sub: true, itemLabel: 'Facility', min: 1, max: 8,
            showIf: { key: 'njFacilitiesInterested', equals: 'Yes' },
            fields: [
              { name: 'name', label: 'Facility name', type: 'text', required: true },
              { name: 'city', label: 'City', type: 'text' },
              { name: 'contact', label: 'Contact person', type: 'text' },
              { name: 'status', label: 'Current status', type: 'text', placeholder: 'e.g., Met once, awaiting paperwork' }
            ] }
        ]
      },

      /* ------------------------------------------------------------ 7 */
      {
        id: 'il', title: 'Illinois', badge: 'Because you selected Illinois',
        intro: 'A few questions specific to launching in Illinois.',
        showIf: { key: 'serviceStates', includes: 'Illinois' },
        questions: [
          { key: 'ilImpact', label: 'Have you created or started an Illinois IMPACT enrollment?', type: 'radio', pills: true, options: ['Yes', 'No', 'Not sure what this is'] },
          { key: 'ilMedicaidNumber', label: 'Do you currently have an Illinois Medicaid provider number?', type: 'radio', pills: true, options: ['Yes', 'No', 'Application pending'] },
          { key: 'ilServiceType', label: 'What transportation service type are you planning to operate in Illinois?', type: 'radio',
            options: ['Ambulatory/service car', 'Medicar or wheelchair transportation', 'Other', 'Not sure—need CareTransit guidance'] },
          { key: 'ilTraining', label: 'Have you completed any required Illinois transportation-provider training or screening?', type: 'radio', pills: true, options: ['Yes', 'No', 'In progress', 'Not sure'] },
          { key: 'ilDrivers', label: 'Do you currently have drivers identified for the business?', type: 'radio', pills: true, options: YN }
        ]
      },

      /* ------------------------------------------------------------ 8 */
      {
        id: 'drivers', title: 'Drivers & Staffing',
        intro: 'Who will be behind the wheel, and what is already in place for them.',
        questions: [
          { key: 'ownerDrives', label: 'Will you personally drive for the company?', type: 'radio', pills: true, options: ['Yes', 'No', 'Initially'] },
          { key: 'driverCount', label: 'How many drivers do you expect to start with?', type: 'radio', pills: true,
            options: ['Owner only', '1 additional driver', '2–3', '4+', 'Not determined'] },
          { key: 'validLicenses', label: 'Do your current drivers have valid driver’s licenses?', type: 'radio', pills: true, options: ['Yes', 'No', 'Not applicable yet'] },
          { key: 'certifications', label: 'Which certifications/training have you or your drivers already completed?', type: 'checkbox', hint: 'Select all that apply.',
            exclusive: ['None yet'],
            options: ['CPR', 'First Aid', 'AED', 'Defensive Driving', 'Passenger Assistance', 'Wheelchair Securement', 'HIPAA/Privacy Training', 'Other', 'None yet'] },
          { key: 'staffingDocs', label: 'Do you currently have the following?', type: 'checkbox', hint: 'Check everything you already have.',
            exclusive: ['None yet'],
            options: ['Employee application', 'Driver application', 'Driver file', 'Background-check process', 'Motor-vehicle-record process', 'Drug/alcohol policy', 'Employee handbook', 'Driver handbook', 'None yet'] }
        ]
      },

      /* ------------------------------------------------------------ 9 */
      {
        id: 'operations', title: 'Operations',
        intro: 'How trips will be scheduled, dispatched and documented.',
        questions: [
          { key: 'dispatchSoftware', label: 'Have you selected dispatch/scheduling software?', type: 'radio', pills: true, options: ['Yes', 'No', 'Need CareTransit recommendation'] },
          { key: 'dispatchMethod', label: 'How do you plan to dispatch trips?', type: 'radio',
            options: ['Owner dispatches', 'Dedicated dispatcher', 'Driver app/software', 'Outsourced', 'Not determined'] },
          { key: 'operatingDays', label: 'What days do you plan to operate?', type: 'radio', pills: true,
            options: ['Monday–Friday', 'Monday–Saturday', '7 days', 'Other', 'Not determined'] },
          { key: 'operatingHours', label: 'What hours do you anticipate operating?', type: 'text', placeholder: 'e.g., 5:00 AM – 7:00 PM' },
          { key: 'policies', label: 'Do you already have written policies and procedures?', type: 'radio', pills: true, options: ['Yes', 'No', 'In progress'] },
          { key: 'operatingForms', label: 'Do you currently have trip sheets, dispatch logs, incident reports, vehicle inspection forms, maintenance logs and other operating forms?', type: 'radio', pills: true, options: ['Yes', 'Some', 'No'] }
        ]
      },

      /* ------------------------------------------------------------ 10 */
      {
        id: 'revenue', title: 'Contracts & Revenue Development',
        intro: 'Last section. Who you want to serve and any opportunities already in motion.',
        questions: [
          { key: 'targetClients', label: 'Who would you like your company to provide transportation for?', type: 'checkbox', hint: 'Select all that apply.',
            options: ['Dialysis centers', 'Hospitals', 'Skilled nursing facilities', 'Assisted living', 'Senior living communities', 'Rehabilitation facilities', 'Behavioral-health organizations', 'Adult day programs', 'Private-pay clients', 'Medicaid-related opportunities', 'Transportation brokers', 'Other'] },
          { key: 'spokeWithReferrals', label: 'Have you already spoken with any potential facilities or referral sources?', type: 'radio', pills: true, options: YN },
          { key: 'hasOpportunities', label: 'Do you currently have any contracts, letters of intent, referrals, or organizations interested in working with you?', type: 'radio', pills: true, options: YN },
          { key: 'opportunities', label: 'Opportunities', type: 'repeater', sub: true, itemLabel: 'Opportunity', min: 1, max: 8,
            showIf: { key: 'hasOpportunities', equals: 'Yes' },
            fields: [
              { name: 'org', label: 'Organization', type: 'text', required: true },
              { name: 'contact', label: 'Contact', type: 'text' },
              { name: 'opportunity', label: 'Opportunity', type: 'text', placeholder: 'e.g., Dialysis rides, 3x weekly' },
              { name: 'status', label: 'Current status', type: 'text' }
            ] },
          { key: 'contractHelp', label: 'Would you like CareTransit to assist with contract-readiness and business-development support?', type: 'radio', pills: true, options: YN }
        ]
      }
    ]
  };
})();
