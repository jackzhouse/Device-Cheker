export type Language = "en" | "id";

export interface Translations {
  common: {
    loading: string;
    retry: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    download: string;
    search: string;
    filter: string;
    clear: string;
    yes: string;
    no: string;
    submit: string;
    back: string;
    next: string;
    add: string;
    remove: string;
    tooltips: {
      deleteOption: string;
      addItem: string;
      viewDetails: string;
      downloadPDF: string;
      editCheck: string;
      deleteCheck: string;
      viewHistory: string;
      editEmployee: string;
      deleteEmployee: string;
      addWorkApp: string;
      addNonWorkApp: string;
      addAntivirus: string;
      addVPN: string;
      addStorage: string;
      removeItem: string;
    };
    select: {
      navigate: string;
      select: string;
      createNew: string;
      toCreate: string;
      toNavigate: string;
      toSelect: string;
      navigateOptions: string;
      selectOption: string;
      placeholder: string;
      keyboardHint: string;
    };
  };
  header: {
    title: string;
    form: string;
    dashboard: string;
    checkData: string;
    employeeData: string;
    documentation: string;
    lastCheckReport: string;
    toggleTheme: string;
    toggleLanguage: string;
  };
  home: {
    welcome: string;
    description: string;
  };
  form: {
    title: string;
    description: string;
    sections: {
      employee: string;
      deviceDetail: string;
      operatingSystem: string;
      specification: string;
      deviceCondition: string;
      applications: string;
      security: string;
      additionalInfo: string;
    };
    formSections: string;
    progress: {
      title: string;
      complete: string;
      sectionsComplete: string;
      saveDraft: string;
      draftSaved: string;
      noDraft: string;
    };
    employeeInfo: {
      title: string;
      fullName: string;
      employeeId: string;
      position: string;
      department: string;
      totalChecks: string;
      selectEmployee: string;
      checkDate: string;
      checkDatePlaceholder: string;
      useLastVersion: string;
      loadingLastVersion: string;
      pleaseWait: string;
      noPreviousRecord: string;
      lastVersionLoaded: string;
    };
    deviceDetail: {
      title: string;
      deviceType: string;
      ownership: string;
      deviceBrand: string;
      deviceModel: string;
      serialNumber: string;
      deviceTypeOptions: {
        pc: string;
        laptop: string;
      };
      ownershipOptions: {
        company: string;
        personal: string;
      };
    };
    operatingSystem: {
      title: string;
      osType: string;
      osVersion: string;
      osLicense: string;
      regularUpdates: string;
      osTypeOptions: {
        windows: string;
        linux: string;
        mac: string;
      };
      osLicenseOptions: {
        original: string;
        pirated: string;
        openSource: string;
        unknown: string;
      };
    };
    specification: {
      title: string;
      ramCapacity: string;
      memoryType: string;
      storageCapacity: string;
      storage: string;
      processor: string;
      memoryTypeOptions: {
        hdd: string;
        ssd: string;
      };
    };
    deviceCondition: {
      title: string;
      deviceSuitability: string;
      battery: string;
      keyboard: string;
      touchpad: string;
      monitor: string;
      wifi: string;
      suitabilityOptions: {
        suitable: string;
        limitedSuitability: string;
        needsRepair: string;
        unsuitable: string;
      };
    };
    applications: {
      title: string;
      workApplications: string;
      nonWorkApplications: string;
      applicationName: string;
      license: string;
      notes: string;
      licenseOptions: {
        original: string;
        pirated: string;
        openSource: string;
        unknown: string;
      };
      notesPlaceholder: string;
    };
    security: {
      title: string;
      antivirus: string;
      vpn: string;
      status: string;
      statusOptions: {
        active: string;
        inactive: string;
        available: string;
        notAvailable: string;
      };
    };
    additionalInfo: {
      title: string;
      passwordUsage: string;
      inspectorPICName: string;
      otherNotes: string;
      passwordUsageOptions: {
        available: string;
        notAvailable: string;
      };
      otherNotesPlaceholder: string;
      pressEnter: String;
    };
    validation: {
      employeeRequired: string;
      checkDateRequired: string;
      deviceTypeRequired: string;
      ownershipRequired: string;
      deviceBrandRequired: string;
      deviceModelRequired: string;
      serialNumberRequired: string;
      osTypeRequired: string;
      osVersionRequired: string;
      osLicenseRequired: string;
      deviceSuitabilityRequired: string;
      passwordUsageRequired: string;
      inspectorPICNameRequired: string;
    };
    toast: {
      createSuccess: string;
      createFailed: string;
      selectEmployee: string;
      selectInspector: string;
      optionAdded: string;
      optionSaveFailed: string;
    };
    placeholders: {
      deviceBrand: string;
      deviceModel: string;
      serialNumber: string;
      osVersion: string;
      ramCapacity: string;
      storageCapacity: string;
      processor: string;
      battery: string;
      keyboard: string;
      touchpad: string;
      monitor: string;
      wifi: string;
      applicationName: string;
      notes: string;
      inspectorName: string;
      otherNotes: string;
    };
    help: {
      tooltip: string;
      title: string;
      description: string;
      about: {
        title: string;
        description1: string;
        description2: string;
      };
      howToFill: {
        title: string;
        step1: {
          title: string;
          description: string;
        };
        step2: {
          title: string;
          description: string;
        };
        step3: {
          title: string;
          description: string;
        };
        step4: {
          title: string;
          description: string;
        };
        step5: {
          title: string;
          description: string;
        };
        step6: {
          title: string;
          description: string;
        };
        step7: {
          title: string;
          description: string;
        };
        step8: {
          title: string;
          description: string;
        };
      };
      keyboardShortcuts: {
        title: string;
        nextField: string;
        prevField: string;
        submitForm: string;
        closeModal: string;
        newLine: string;
        jumpSection: string;
        saveForm: string;
        toggleHelp: string;
        jumpToSection: string;
      };
      proTips: {
        title: string;
        tip1: string;
        tip2: string;
        tip3: string;
        tip4: string;
      };
      floatingPanel: {
        title: string;
        showAll: string;
        hidePanel: string;
      };
      submitButton: {
        tooltip: string;
      };
    };
  };
  checkData: {
    title: string;
    description: string;
    filters: {
      searchPlaceholder: string;
      allConditions: string;
      allOwnership: string;
      clearFilters: string;
      groupByEmployee: string;
      missingVersion: string;
    };
    empty: string;
    buttons: {
      viewAllHistory: string;
      viewAllChecks: string;
    };
    badge: {
      total: string;
    };
    suitability: {
      suitable: string;
      limitedSuitability: string;
      needsRepair: string;
      unsuitable: string;
    };
    confirmDelete: string;
    toast: {
      fetchFailed: string;
      deleteSuccess: string;
      deleteFailed: string;
      pdfGenerating: string;
      pdfSuccess: string;
      pdfFailed: string;
    };
    summary: {
      totalChecks: string;
      pcDevices: string;
      laptops: string;
      companyOwned: string;
    };
    checkHistory: string;
    exportAll: string;
    noChecks: string;
    resultsFound: string;
  };
  lastCheckReport: {
    title: string;
    description: string;
    filters: {
      searchPlaceholder: string;
      allStatuses: string;
      allDepartments: string;
      allOwnership: string;
      dateFrom: string;
      dateTo: string;
      clearFilters: string;
    };
    summary: {
      totalEmployees: string;
      suitable: string;
      issues: string;
      unsuitable: string;
    };
    table: {
      no: string;
      employee: string;
      department: string;
      device: string;
      os: string;
      ownership: string;
      status: string;
      checkDate: string;
      version: string;
      actions: string;
    };
    empty: string;
    noResults: string;
  };
  employee: {
    title: string;
    description: string;
    addButton: string;
    searchPlaceholder: string;
    employeeId: string;
    department: string;
    lastCheck: string;
    filters: {
      allPositions: string;
      allDepartments: string;
      allStatuses: string;
    };
    empty: string;
    totalChecks: string;
    resultsFound: string;
    confirmDelete: string;
    confirmDeleteWithChecks: string;
    toast: {
      fetchFailed: string;
      deleteSuccess: string;
      deleteFailed: string;
    };
  };
  employeeDetail: {
    title: string;
    employeeId: string;
    backToEmployees: string;
    deviceChecks: string;
    noChecks: string;
    totalChecks: string;
  };
  dashboard: {
    title: string;
    description: string;
    timeRange: {
      all: string;
      last30Days: string;
      last6Months: string;
      last1Year: string;
    };
    summary: {
      totalChecks: string;
      totalEmployees: string;
      totalPCs: string;
      totalLaptops: string;
      companyOwned: string;
      personalOwned: string;
      urgentDevices: string;
    };
    charts: {
      deviceType: string;
      ownership: string;
      suitability: string;
      osType: string;
      osLicense: string;
      antivirus: string;
      vpn: string;
      trendsOverTime: string;
      departmentBreakdown: string;
    };
    urgentDevices: {
      title: string;
      noUrgent: string;
      viewDetails: string;
      needsRepair: string;
      unsuitable: string;
    };
    toast: {
      fetchFailed: string;
    };
  };
  employeeHistory: {
    title: string;
    fetchFailed: string;
    notFound: string;
    loading: string;
    goBack: string;
    addNewCheck: string;
    confirmDelete: string;
    toast: {
      deleteSuccess: string;
      deleteFailed: string;
      pdfGenerating: string;
      pdfSuccess: string;
      pdfFailed: string;
    };
  };
  createEmployee: {
    title: string;
    description: string;
    formTitle: string;
    formDescription: string;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
    email: string;
    phoneNumber: string;
    status: string;
    employeeIdHint: string;
    statusOptions: {
      active: string;
      inactive: string;
      resigned: string;
    };
    required: string;
    placeholders: {
      employeeId: string;
      firstName: string;
      lastName: string;
      position: string;
      department: string;
      email: string;
      phoneNumber: string;
    };
    backToEmployees: string;
    cancel: string;
    createButton: string;
    creating: string;
    validation: {
      requiredFields: string;
      createSuccess: string;
      createFailed: string;
    };
  };
  errors: {
    generic: string;
    network: string;
    notFound: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: "Loading...",
      retry: "Retry",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      download: "Download",
      search: "Search",
      filter: "Filter",
      clear: "Clear",
      yes: "Yes",
      no: "No",
      submit: "Submit",
      back: "Back",
      next: "Next",
      add: "Add",
      remove: "Remove",
      tooltips: {
        deleteOption: "Delete option",
        addItem: "Add item",
        viewDetails: "View details",
        downloadPDF: "Download PDF",
        editCheck: "Edit check",
        deleteCheck: "Delete check",
        viewHistory: "View history",
        editEmployee: "Edit employee",
        deleteEmployee: "Delete employee",
        addWorkApp: "Add work application",
        addNonWorkApp: "Add non-work application",
        addAntivirus: "Add antivirus",
        addVPN: "Add VPN",
        addStorage: "Add storage",
        removeItem: "Remove item",
      },
      select: {
        navigate: "navigate",
        select: "select",
        createNew: "create new",
        toCreate: "to create",
        toNavigate: "to navigate",
        toSelect: "to select",
        navigateOptions: "Navigate options",
        selectOption: "Select option",
        placeholder: "Select or type to create...",
        keyboardHint: "Keyboard shortcuts",
      },
    },
    header: {
      title: "Device Checking System",
      form: "Form",
      dashboard: "Dashboard",
      checkData: "Check Data",
      employeeData: "Employee Data",
      documentation: "Documentation",
      lastCheckReport: "Last Checking Report",
      toggleTheme: "Toggle theme",
      toggleLanguage: "Toggle language",
    },
    home: {
      welcome: "Welcome to Device Checking System",
      description: "Manage device checking records efficiently",
    },
    form: {
      title: "Device Checking Form",
      description: "Fill in device checking information below",
      sections: {
        employee: "Employee",
        deviceDetail: "Device Detail",
        operatingSystem: "Operating System",
        specification: "Specification",
        deviceCondition: "Device Condition",
        applications: "Applications",
        security: "Security",
        additionalInfo: "Additional Info",
      },
      formSections: "Form Sections",
      progress: {
        title: "Form Progress",
        complete: "Complete",
        sectionsComplete: "sections completed",
        saveDraft: "Save draft",
        draftSaved: "Draft saved",
        noDraft: "No draft saved",
      },
      employeeInfo: {
        title: "Employee Information",
        fullName: "Full Name",
        employeeId: "Employee ID",
        position: "Position",
        department: "Department",
        totalChecks: "Total Checks",
        selectEmployee: "Select an employee",
        checkDate: "Check Date",
        checkDatePlaceholder: "Select check date",
        useLastVersion: "Use last checking data version",
        loadingLastVersion: "Loading last version...",
        pleaseWait: "Please wait while we load the data...",
        noPreviousRecord: "No previous check data found for this employee",
        lastVersionLoaded: "Last check data loaded successfully",
      },
      deviceDetail: {
        title: "Device Detail",
        deviceType: "Device Type",
        ownership: "Ownership",
        deviceBrand: "Device Brand",
        deviceModel: "Device Model",
        serialNumber: "Serial Number",
        deviceTypeOptions: {
          pc: "PC",
          laptop: "Laptop",
        },
        ownershipOptions: {
          company: "Company",
          personal: "Personal",
        },
      },
      operatingSystem: {
        title: "Operating System",
        osType: "OS Type",
        osVersion: "OS Version",
        osLicense: "OS License",
        regularUpdates: "Regular Updates Enabled",
        osTypeOptions: {
          windows: "Windows",
          linux: "Linux",
          mac: "Mac",
        },
        osLicenseOptions: {
          original: "Original",
          pirated: "Pirated",
          openSource: "Open Source",
          unknown: "Unknown",
        },
      },
      specification: {
        title: "Specification (Optional)",
        ramCapacity: "RAM Capacity",
        memoryType: "Memory Type",
        storageCapacity: "Storage Capacity",
        storage: "Storage",
        processor: "Processor",
        memoryTypeOptions: {
          hdd: "HDD",
          ssd: "SSD",
        },
      },
      deviceCondition: {
        title: "Device Condition",
        deviceSuitability: "Device Suitability",
        battery: "Battery",
        keyboard: "Keyboard",
        touchpad: "Touchpad",
        monitor: "Monitor",
        wifi: "WiFi",
        suitabilityOptions: {
          suitable: "Suitable",
          limitedSuitability: "Limited Suitability",
          needsRepair: "Needs Repair",
          unsuitable: "Unsuitable",
        },
      },
      applications: {
        title: "Applications",
        workApplications: "Work Applications",
        nonWorkApplications: "Non-Work Applications",
        applicationName: "Application name",
        license: "License",
        notes: "Notes",
        licenseOptions: {
          original: "Original",
          pirated: "Pirated",
          openSource: "Open Source",
          unknown: "Unknown",
        },
        notesPlaceholder: "Notes (optional)",
      },
      security: {
        title: "Security",
        antivirus: "Antivirus Software",
        vpn: "VPN Software",
        status: "Status",
        statusOptions: {
          active: "Active",
          inactive: "Inactive",
          available: "Available",
          notAvailable: "Not Available",
        },
      },
      additionalInfo: {
        title: "Additional Information",
        passwordUsage: "Password Usage",
        inspectorPICName: "Inspector PIC Name",
        otherNotes: "Other Notes",
        passwordUsageOptions: {
          available: "Available",
          notAvailable: "Not Available",
        },
        otherNotesPlaceholder: "Enter any additional notes...",
        pressEnter: "Press Enter to save, Shift+Enter for new line",
      },
      validation: {
        employeeRequired: "Please select an employee",
        checkDateRequired: "Check date is required",
        deviceTypeRequired: "Device type is required",
        ownershipRequired: "Ownership is required",
        deviceBrandRequired: "Device brand is required",
        deviceModelRequired: "Device model is required",
        serialNumberRequired: "Serial number is required",
        osTypeRequired: "OS type is required",
        osVersionRequired: "OS version is required",
        osLicenseRequired: "OS license is required",
        deviceSuitabilityRequired: "Device suitability is required",
        passwordUsageRequired: "Password usage is required",
        inspectorPICNameRequired: "Inspector PIC name is required",
      },
      toast: {
        createSuccess: "Device check created successfully",
        createFailed: "Failed to create device check",
        selectEmployee: "Please select an employee",
        selectInspector: "Please select an inspector PIC",
        optionAdded: "added successfully",
        optionSaveFailed: "Failed to save option to database",
      },
      placeholders: {
        deviceBrand: "Select or create device brand...",
        deviceModel: "",
        serialNumber: "",
        osVersion: "e.g., Windows 11, Ubuntu 22.04, macOS Sonoma",
        ramCapacity: "Select or create RAM capacity...",
        storageCapacity: "Select or create storage capacity...",
        processor: "Select or create processor...",
        battery: "e.g., Good, Fair, Poor",
        keyboard: "e.g., Good, Fair, Poor",
        touchpad: "e.g., Good, Fair, Poor",
        monitor: "e.g., Good, Fair, Poor",
        wifi: "e.g., Good, Fair, Poor",
        applicationName: "e.g., Microsoft Office, Adobe Reader",
        notes: "Notes (optional)",
        inspectorName: "Select or create inspector name...",
        otherNotes: "Enter any additional notes...",
      },
      help: {
        tooltip: "Form Help & Instructions",
        title: "Form Help & Instructions",
        description: "Learn how to fill the device check form and use keyboard shortcuts to work faster.",
        about: {
          title: "About This Form",
          description1: "This form is used to record device check information for employees. It captures details about the device, operating system, specifications, condition, installed applications, and security status.",
          description2: "Fill out all required fields (marked with *) and ensure accuracy for proper device tracking and compliance.",
        },
        howToFill: {
          title: "How to Fill Form",
          step1: {
            title: "1. Employee Information",
            description: "Select an employee from the autocomplete dropdown. Their information will display automatically. Choose the check date. Optionally, check \"Use Last Version\" to auto-fill with previous device check data.",
          },
          step2: {
            title: "2. Device Details",
            description: "Enter device type (PC/Laptop), ownership (company/personal), brand, model, and serial number. The brand field allows you to create new options if needed.",
          },
          step3: {
            title: "3. Operating System",
            description: "Specify the OS type (Windows/Linux/Mac), version, license status, and whether regular updates are enabled.",
          },
          step4: {
            title: "4. Specifications",
            description: "Enter RAM capacity, processor type, and storage information. You can add multiple storage entries (HDD/SSD) with different capacities by clicking the Add button.",
          },
          step5: {
            title: "5. Device Condition",
            description: "Assess the overall device suitability and provide condition details for battery, keyboard, touchpad, monitor, and WiFi. Use descriptive terms like \"Good\", \"Fair\", \"Needs Replacement\".",
          },
          step6: {
            title: "6. Applications",
            description: "List all work-related and non-work applications. For each application, specify the name, license type (Original/Pirated/Open Source/Unknown), and any notes.",
          },
          step7: {
            title: "7. Security",
            description: "Set antivirus status (Active/Inactive) and list installed antivirus software with license details. Set VPN status (Available/Not Available) and list VPN connections with license information.",
          },
          step8: {
            title: "8. Additional Information",
            description: "Indicate if device passwords are available, enter the inspector PIC name, and add any other notes. Press Enter in the notes field to submit the form quickly.",
          },
        },
        keyboardShortcuts: {
          title: "Keyboard Shortcuts",
          nextField: "Move to next field",
          prevField: "Move to previous field",
          submitForm: "Submit form (in notes)",
          closeModal: "Close modal",
          newLine: "New line (in notes)",
          jumpSection: "Jump to section",
          saveForm: "Save form",
          toggleHelp: "Toggle help",
          jumpToSection: "Jump to section (Alt + 1-8)",
        },
        floatingPanel: {
          title: "Keyboard Shortcuts",
          showAll: "View all shortcuts",
          hidePanel: "Hide panel",
        },
        submitButton: {
          tooltip: "Press Ctrl/Cmd + S to save",
        },
        proTips: {
          title: "Pro Tips",
          tip1: "Use the sidebar navigation on large screens to quickly jump between form sections.",
          tip2: "Creatable select dropdowns remember your entries for faster data entry next time.",
          tip3: "The \"Use Last Version\" feature saves time by auto-filling with previous check data.",
          tip4: "All dropdown selections are saved and become available for future use.",
        },
      },
    },
    checkData: {
      title: "Device Check Data",
      description: "View and manage all device checking records",
      filters: {
        searchPlaceholder: "Search by employee, device brand or model...",
        allConditions: "All Conditions",
        allOwnership: "All Ownership",
        clearFilters: "Clear Filters",
        groupByEmployee: "Group by Employee",
        missingVersion: "Missing version",
      },
      empty: "No device checks found",
      buttons: {
        viewAllHistory: "View All History",
        viewAllChecks: "View all {count} checks",
      },
      badge: {
        total: "Total: {count} checks",
      },
      suitability: {
        suitable: "Suitable",
        limitedSuitability: "Limited Suitability",
        needsRepair: "Needs Repair",
        unsuitable: "Unsuitable",
      },
      confirmDelete: "Are you sure you want to delete this device check?",
      toast: {
        fetchFailed: "Failed to fetch device checks",
        deleteSuccess: "Device check deleted successfully",
        deleteFailed: "Failed to delete device check",
        pdfGenerating: "Generating PDF...",
        pdfSuccess: "PDF downloaded successfully",
        pdfFailed: "Failed to generate PDF",
      },
      summary: {
        totalChecks: "Total Checks",
        pcDevices: "PC Devices",
        laptops: "Laptops",
        companyOwned: "Company Owned",
      },
      checkHistory: "Check History",
      exportAll: "Export All Data",
      noChecks: "No checking records found for this employee.",
      resultsFound: "checks found",
    },
    lastCheckReport: {
      title: "Last Checking Report",
      description: "Summary of the most recent device check for each employee.",
      filters: {
        searchPlaceholder: "Search employee, ID, or device...",
        allStatuses: "All Statuses",
        allDepartments: "All Departments",
        allOwnership: "All Ownership",
        dateFrom: "Date From",
        dateTo: "Date To",
        clearFilters: "Clear Filters",
      },
      summary: {
        totalEmployees: "Total Employees",
        suitable: "Suitable",
        issues: "Issues Found",
        unsuitable: "Unsuitable",
      },
      table: {
        no: "No",
        employee: "Employee",
        department: "Department",
        device: "Device",
        os: "OS",
        ownership: "Ownership",
        status: "Status",
        checkDate: "Check Date",
        version: "Version",
        actions: "Actions",
      },
      empty: "No device check records found in the system.",
      noResults: "No results match your current filters.",
    },
    employee: {
      title: "Employee Data",
      description: "View and manage all employee records",
      addButton: "Add Employee",
      searchPlaceholder: "Search by name, position, or ID...",
      employeeId: "Employee ID",
      department: "Department",
      lastCheck: "Last Check",
      filters: {
        allPositions: "All Positions",
        allDepartments: "All Departments",
        allStatuses: "All Statuses",
      },
      empty: "No employees found",
      totalChecks: "Total Checks",
      resultsFound: "employees found",
      confirmDelete: "Are you sure you want to delete this employee?",
      confirmDeleteWithChecks: "This employee has {count} device check(s). Are you sure?",
      toast: {
        fetchFailed: "Failed to fetch employees",
        deleteSuccess: "Employee deleted successfully",
        deleteFailed: "Failed to delete employee",
      },
    },
    employeeDetail: {
      title: "Employee Details",
      employeeId: "Employee ID",
      backToEmployees: "Back to Employees",
      deviceChecks: "Device Checks",
      noChecks: "No device checks found for this employee",
      totalChecks: "Total Checks",
    },
    dashboard: {
      title: "Device Checking Statistics",
      description: "Overview of device checking data and trends",
      timeRange: {
        all: "All Time",
        last30Days: "Last 30 Days",
        last6Months: "Last 6 Months",
        last1Year: "Last 1 Year",
      },
      summary: {
        totalChecks: "Total Checks",
        totalEmployees: "Total Employees",
        totalPCs: "Total PCs",
        totalLaptops: "Total Laptops",
        companyOwned: "Company Owned",
        personalOwned: "Personal Owned",
        urgentDevices: "Urgent Devices",
      },
      charts: {
        deviceType: "Device Type Distribution",
        ownership: "Device Ownership",
        suitability: "Device Suitability",
        osType: "Operating System Distribution",
        osLicense: "OS License Status",
        antivirus: "Antivirus Status",
        vpn: "VPN Status",
        trendsOverTime: "Checks Over Time",
        departmentBreakdown: "Department Breakdown",
      },
      urgentDevices: {
        title: "⚠️ Urgent Devices",
        noUrgent: "No urgent devices found",
        viewDetails: "View Details",
        needsRepair: "Needs Repair",
        unsuitable: "Unsuitable",
      },
      toast: {
        fetchFailed: "Failed to fetch statistics",
      },
    },
    employeeHistory: {
      title: "Employee History",
      fetchFailed: "Failed to fetch employee history",
      notFound: "Employee not found",
      loading: "Loading employee history...",
      goBack: "Go Back",
      addNewCheck: "Add New Check",
      confirmDelete: "Are you sure you want to delete this device check?",
      toast: {
        deleteSuccess: "Device check deleted successfully",
        deleteFailed: "Failed to delete device check",
        pdfGenerating: "Generating PDF...",
        pdfSuccess: "PDF downloaded successfully",
        pdfFailed: "Failed to generate PDF",
      },
    },
    createEmployee: {
      title: "Create New Employee",
      description:
        "Add a new employee to the system. This will allow you to create device checks for them.",
      formTitle: "Employee Information",
      formDescription:
        "Fill in required fields marked with *. Contact information and status are optional.",
      firstName: "First Name",
      lastName: "Last Name",
      position: "Position",
      department: "Department",
      email: "Email",
      phoneNumber: "Phone Number",
      status: "Status",
      statusOptions: {
        active: "Active",
        inactive: "Inactive",
        resigned: "Resigned",
      },
      required: "*",
      placeholders: {
        employeeId: "Enter employee id",
        firstName: "Enter first name",
        lastName: "Enter last name",
        position: "e.g., Software Engineer",
        department: "e.g., IT, HR, Marketing",
        email: "e.g., john.doe@company.com",
        phoneNumber: "e.g., +62 812 3456 7890",
      },
      backToEmployees: "Back to Employees",
      cancel: "Cancel",
      createButton: "Create Employee",
      creating: "Creating...",
      employeeIdHint: "Leave blank for auto-generation.",
      validation: {
        requiredFields: "Please fill in all required fields",
        createSuccess: "Employee created successfully",
        createFailed: "Failed to create employee",
      },
    },
    errors: {
      generic: "An error occurred",
      network: "Network error. Please check your connection",
      notFound: "Resource not found",
    },
  },
  id: {
    common: {
      loading: "Memuat...",
      retry: "Coba lagi",
      save: "Simpan",
      cancel: "Batal",
      delete: "Hapus",
      edit: "Edit",
      view: "Lihat",
      download: "Unduh",
      search: "Cari",
      filter: "Filter",
      clear: "Hapus",
      yes: "Ya",
      no: "Tidak",
      submit: "Kirim",
      back: "Kembali",
      next: "Lanjut",
      add: "Tambah",
      remove: "Hapus",
      tooltips: {
        deleteOption: "Hapus opsi",
        addItem: "Tambah item",
        viewDetails: "Lihat detail",
        downloadPDF: "Unduh PDF",
        editCheck: "Edit pengecekan",
        deleteCheck: "Hapus pengecekan",
        viewHistory: "Lihat riwayat",
        editEmployee: "Edit karyawan",
        deleteEmployee: "Hapus karyawan",
        addWorkApp: "Tambah aplikasi kerja",
        addNonWorkApp: "Tambah aplikasi non-kerja",
        addAntivirus: "Tambah antivirus",
        addVPN: "Tambah VPN",
        addStorage: "Tambah penyimpanan",
        removeItem: "Hapus item",
      },
      select: {
        navigate: "navigasi",
        select: "pilih",
        createNew: "buat baru",
        toCreate: "untuk membuat",
        toNavigate: "untuk menavigasi",
        toSelect: "untuk memilih",
        navigateOptions: "Navigasi opsi",
        selectOption: "Pilih opsi",
        placeholder: "Pilih atau ketik untuk membuat...",
        keyboardHint: "Pintasan keyboard",
      },
    },
    header: {
      title: "Sistem Pengecekan Perangkat",
      form: "Formulir",
      dashboard: "Dashboard",
      checkData: "Data Pengecekan",
      employeeData: "Data Karyawan",
      documentation: "Dokumentasi",
      lastCheckReport: "Laporan Terakhir",
      toggleTheme: "Ganti tema",
      toggleLanguage: "Ganti bahasa",
    },
    home: {
      welcome: "Selamat datang di Sistem Pengecekan Perangkat",
      description: "Kelola data pengecekan perangkat dengan efisien",
    },
    form: {
      title: "Formulir Pengecekan Perangkat",
      description: "Isi informasi pengecekan perangkat di bawah ini",
      sections: {
        employee: "Karyawan",
        deviceDetail: "Detail Perangkat",
        operatingSystem: "Sistem Operasi",
        specification: "Spesifikasi",
        deviceCondition: "Kondisi Perangkat",
        applications: "Aplikasi",
        security: "Keamanan",
        additionalInfo: "Info Tambahan",
      },
      formSections: "Bagian Formulir",
      progress: {
        title: "Progres Formulir",
        complete: "Selesai",
        sectionsComplete: "bagian selesai",
        saveDraft: "Simpan draft",
        draftSaved: "Draft tersimpan",
        noDraft: "Belum ada draft",
      },
      employeeInfo: {
        title: "Informasi Karyawan",
        fullName: "Nama Lengkap",
        employeeId: "ID Karyawan",
        position: "Posisi",
        department: "Departemen",
        totalChecks: "Total Pengecekan",
        selectEmployee: "Pilih karyawan",
        checkDate: "Tanggal Pengecekan",
        checkDatePlaceholder: "Pilih tanggal pengecekan",
        useLastVersion: "Gunakan data versi terakhir",
        loadingLastVersion: "Memuat data terakhir...",
        pleaseWait: "Mohon tunggu sebentar saat kami memuat data...",
        noPreviousRecord:
          "Tidak ada data pengecekan sebelumnya untuk karyawan ini",
        lastVersionLoaded: "Data pengecekan terakhir berhasil dimuat",
      },
      deviceDetail: {
        title: "Detail Perangkat",
        deviceType: "Tipe Perangkat",
        ownership: "Kepemilikan",
        deviceBrand: "Merk Perangkat",
        deviceModel: "Model Perangkat",
        serialNumber: "Nomor Seri",
        deviceTypeOptions: {
          pc: "PC",
          laptop: "Laptop",
        },
        ownershipOptions: {
          company: "Perusahaan",
          personal: "Pribadi",
        },
      },
      operatingSystem: {
        title: "Sistem Operasi",
        osType: "Tipe OS",
        osVersion: "Versi OS",
        osLicense: "Lisensi OS",
        regularUpdates: "Update Berkala Diaktifkan",
        osTypeOptions: {
          windows: "Windows",
          linux: "Linux",
          mac: "Mac",
        },
        osLicenseOptions: {
          original: "Original",
          pirated: "Bajakan",
          openSource: "Open Source",
          unknown: "Tidak Diketahui",
        },
      },
      specification: {
        title: "Spesifikasi (Opsional)",
        ramCapacity: "Kapasitas RAM",
        memoryType: "Tipe Memori",
        storageCapacity: "Kapasitas Penyimpanan",
        storage: "Penyimpanan",
        processor: "Prosesor",
        memoryTypeOptions: {
          hdd: "HDD",
          ssd: "SSD",
        },
      },
      deviceCondition: {
        title: "Kondisi Perangkat",
        deviceSuitability: "Kesesuaian Perangkat",
        battery: "Baterai",
        keyboard: "Keyboard",
        touchpad: "Touchpad",
        monitor: "Monitor",
        wifi: "WiFi",
        suitabilityOptions: {
          suitable: "Sesuai",
          limitedSuitability: "Sesuai Terbatas",
          needsRepair: "Perlu Perbaikan",
          unsuitable: "Tidak Sesuai",
        },
      },
      applications: {
        title: "Aplikasi",
        workApplications: "Aplikasi Kerja",
        nonWorkApplications: "Aplikasi Non-Kerja",
        applicationName: "Nama aplikasi",
        license: "Lisensi",
        notes: "Catatan",
        licenseOptions: {
          original: "Original",
          pirated: "Bajakan",
          openSource: "Open Source",
          unknown: "Tidak Diketahui",
        },
        notesPlaceholder: "Catatan (opsional)",
      },
      security: {
        title: "Keamanan",
        antivirus: "Perangkat Lunak Antivirus",
        vpn: "Perangkat Lunak VPN",
        status: "Status",
        statusOptions: {
          active: "Aktif",
          inactive: "Tidak Aktif",
          available: "Tersedia",
          notAvailable: "Tidak Tersedia",
        },
      },
      additionalInfo: {
        title: "Informasi Tambahan",
        passwordUsage: "Penggunaan Password",
        inspectorPICName: "Nama PIC Pemeriksa",
        otherNotes: "Catatan Lainnya",
        passwordUsageOptions: {
          available: "Tersedia",
          notAvailable: "Tidak Tersedia",
        },
        otherNotesPlaceholder: "Masukkan catatan tambahan...",
        pressEnter:
          "Tekan Enter untuk menyimpan, tekan Shift+Enter untuk membuat baris baru",
      },
      validation: {
        employeeRequired: "Silakan pilih karyawan",
        checkDateRequired: "Tanggal pengecekan wajib diisi",
        deviceTypeRequired: "Tipe perangkat wajib diisi",
        ownershipRequired: "Kepemilikan wajib diisi",
        deviceBrandRequired: "Merk perangkat wajib diisi",
        deviceModelRequired: "Model perangkat wajib diisi",
        serialNumberRequired: "Nomor seri wajib diisi",
        osTypeRequired: "Tipe OS wajib diisi",
        osVersionRequired: "Versi OS wajib diisi",
        osLicenseRequired: "Lisensi OS wajib diisi",
        deviceSuitabilityRequired: "Kesesuaian perangkat wajib diisi",
        passwordUsageRequired: "Penggunaan password wajib diisi",
        inspectorPICNameRequired: "Nama PIC pemeriksa wajib diisi",
      },
      toast: {
        createSuccess: "Pengecekan perangkat berhasil dibuat",
        createFailed: "Gagal membuat pengecekan perangkat",
        selectEmployee: "Silakan pilih karyawan",
        selectInspector: "Silakan pilih nama PIC pemeriksa",
        optionAdded: "berhasil ditambahkan",
        optionSaveFailed: "Gagal menyimpan opsi ke database",
      },
      placeholders: {
        deviceBrand: "Pilih atau buat merk perangkat...",
        deviceModel: "",
        serialNumber: "",
        osVersion: "cth: Windows 11, Ubuntu 22.04, macOS Sonoma",
        ramCapacity: "Pilih atau buat kapasitas RAM...",
        storageCapacity: "Pilih atau buat kapasitas penyimpanan...",
        processor: "Pilih atau buat prosesor...",
        battery: "cth: Baik, Cukup, Buruk",
        keyboard: "cth: Baik, Cukup, Buruk",
        touchpad: "cth: Baik, Cukup, Buruk",
        monitor: "cth: Baik, Cukup, Buruk",
        wifi: "cth: Baik, Cukup, Buruk",
        applicationName: "cth: Microsoft Office, Adobe Reader",
        notes: "Catatan (opsional)",
        inspectorName: "Pilih atau buat nama pemeriksa...",
        otherNotes: "Masukkan catatan tambahan...",
      },
      help: {
        tooltip: "Bantuan & Instruksi Formulir",
        title: "Bantuan & Instruksi Formulir",
        description: "Pelajari cara mengisi formulir pengecekan perangkat dan gunakan pintasan keyboard untuk bekerja lebih cepat.",
        about: {
          title: "Tentang Formulir Ini",
          description1: "Formulir ini digunakan untuk merekam informasi pengecekan perangkat karyawan. Ini menangkap detail tentang perangkat, sistem operasi, spesifikasi, kondisi, aplikasi yang diinstal, dan status keamanan.",
          description2: "Isi semua bidang wajib (ditandai dengan *) dan pastikan akurasi untuk pelacakan perangkat dan kepatuhan yang tepat.",
        },
        howToFill: {
          title: "Cara Mengisi Formulir",
          step1: {
            title: "1. Informasi Karyawan",
            description: "Pilih karyawan dari dropdown autocomplete. Informasi mereka akan tampil secara otomatis. Pilih tanggal pengecekan. Opsional, centang \"Gunakan Versi Terakhir\" untuk mengisi otomatis dengan data pengecekan sebelumnya.",
          },
          step2: {
            title: "2. Detail Perangkat",
            description: "Masukkan tipe perangkat (PC/Laptop), kepemilikan (perusahaan/pribadi), merek, model, dan nomor seri. Bidang merek memungkinkan Anda membuat opsi baru jika diperlukan.",
          },
          step3: {
            title: "3. Sistem Operasi",
            description: "Tentukan tipe OS (Windows/Linux/Mac), versi, status lisensi, dan apakah update berkala diaktifkan.",
          },
          step4: {
            title: "4. Spesifikasi",
            description: "Masukkan kapasitas RAM, jenis prosesor, dan informasi penyimpanan. Anda dapat menambahkan beberapa entri penyimpanan (HDD/SSD) dengan kapasitas berbeda dengan mengklik tombol Tambah.",
          },
          step5: {
            title: "5. Kondisi Perangkat",
            description: "Tilai kesesuaian perangkat secara keseluruhan dan berikan detail kondisi untuk baterai, keyboard, touchpad, monitor, dan WiFi. Gunakan istilah deskriptif seperti \"Baik\", \"Cukup\", \"Perlu Penggantian\".",
          },
          step6: {
            title: "6. Aplikasi",
            description: "Daftarkan semua aplikasi kerja dan non-kerja. Untuk setiap aplikasi, tentukan nama, jenis lisensi (Original/Bajakan/Open Source/Tidak Diketahui), dan catatan apa pun.",
          },
          step7: {
            title: "7. Keamanan",
            description: "Tetapkan status antivirus (Aktif/Tidak Aktif) dan daftarkan perangkat lunak antivirus yang diinstal dengan detail lisensi. Tetapkan status VPN (Tersedia/Tidak Tersedia) dan daftarkan koneksi VPN dengan informasi lisensi.",
          },
          step8: {
            title: "8. Informasi Tambahan",
            description: "Indikasikan apakah password perangkat tersedia, masukkan nama PIC pemeriksa, dan tambahkan catatan lainnya. Tekan Enter di bidang catatan untuk mengirimkan formulir dengan cepat.",
          },
        },
        keyboardShortcuts: {
          title: "Pintasan Keyboard",
          nextField: "Pindah ke bidang berikutnya",
          prevField: "Pindah ke bidang sebelumnya",
          submitForm: "Kirim formulir (di catatan)",
          closeModal: "Tutup modal",
          newLine: "Baris baru (di catatan)",
          jumpSection: "Lompat ke bagian",
          saveForm: "Simpan formulir",
          toggleHelp: "Toggle bantuan",
          jumpToSection: "Lompat ke bagian (Alt + 1-8)",
        },
        floatingPanel: {
          title: "Pintasan Keyboard",
          showAll: "Lihat semua pintasan",
          hidePanel: "Sembunyikan panel",
        },
        submitButton: {
          tooltip: "Tekan Ctrl/Cmd + S untuk menyimpan",
        },
        proTips: {
          title: "Tips Pro",
          tip1: "Gunakan navigasi sidebar pada layar besar untuk melompat cepat antar bagian formulir.",
          tip2: "Dropdown yang bisa dibuat mengingat entri Anda untuk pengisian data yang lebih cepat lain kali.",
          tip3: "Fitur \"Gunakan Versi Terakhir\" menghemat waktu dengan mengisi otomatis dengan data pengecekan sebelumnya.",
          tip4: "Semua pilihan dropdown disimpan dan tersedia untuk penggunaan masa depan.",
        },
      },
    },
    checkData: {
      title: "Data Pengecekan Perangkat",
      description: "Lihat dan kelola semua catatan pengecekan perangkat",
      filters: {
        searchPlaceholder:
          "Cari berdasarkan karyawan, merk atau model perangkat...",
        allConditions: "Semua Kondisi",
        allOwnership: "Semua Kepemilikan",
        clearFilters: "Hapus Filter",
        groupByEmployee: "Kelompokkan Berdasarkan Karyawan",
        missingVersion: "Belum versi terbaru",
      },
      empty: "Tidak ada pengecekan perangkat ditemukan",
      buttons: {
        viewAllHistory: "Lihat Semua Riwayat",
        viewAllChecks: "Lihat semua {count} pengecekan",
      },
      badge: {
        total: "Total: {count} pengecekan",
      },
      suitability: {
        suitable: "Sesuai",
        limitedSuitability: "Sesuai Terbatas",
        needsRepair: "Perlu Perbaikan",
        unsuitable: "Tidak Sesuai",
      },
      confirmDelete:
        "Apakah Anda yakin ingin menghapus pengecekan perangkat ini?",
      toast: {
        fetchFailed: "Gagal mengambil data pengecekan perangkat",
        deleteSuccess: "Pengecekan perangkat berhasil dihapus",
        deleteFailed: "Gagal menghapus pengecekan perangkat",
        pdfGenerating: "Membuat PDF...",
        pdfSuccess: "PDF berhasil diunduh",
        pdfFailed: "Gagal membuat PDF",
      },
      summary: {
        totalChecks: "Total Pengecekan",
        pcDevices: "Perangkat PC",
        laptops: "Laptop",
        companyOwned: "Dimiliki Perusahaan",
      },
      checkHistory: "Riwayat Pengecekan",
      exportAll: "Ekspor Semua",
      noChecks: "Tidak ada pengecekan perangkat ditemukan",
      resultsFound: "pengecekan ditemukan",
    },
    lastCheckReport: {
      title: "Laporan Pengecekan Terakhir",
      description: "Ringkasan pengecekan perangkat terbaru untuk setiap karyawan.",
      filters: {
        searchPlaceholder: "Cari karyawan, ID, atau perangkat...",
        allStatuses: "Semua Status",
        allDepartments: "Semua Departemen",
        allOwnership: "Semua Kepemilikan",
        dateFrom: "Tanggal Dari",
        dateTo: "Tanggal Ke",
        clearFilters: "Hapus Filter",
      },
      summary: {
        totalEmployees: "Total Karyawan",
        suitable: "Layak",
        issues: "Masalah Ditemukan",
        unsuitable: "Tidak Layak",
      },
      table: {
        no: "No",
        employee: "Karyawan",
        department: "Departemen",
        device: "Perangkat",
        os: "OS",
        ownership: "Kepemilikan",
        status: "Status",
        checkDate: "Tanggal Cek",
        version: "Versi",
        actions: "Aksi",
      },
      empty: "Tidak ada catatan pengecekan perangkat yang ditemukan dalam sistem.",
      noResults: "Tidak ada hasil yang cocok dengan filter Anda saat ini.",
    },
    employee: {
      title: "Data Karyawan",
      description: "Lihat dan kelola semua catatan karyawan",
      addButton: "Tambah Karyawan",
      searchPlaceholder: "Cari berdasarkan nama, posisi, atau ID...",
      employeeId: "ID Karyawan",
      department: "Departemen",
      lastCheck: "Pengecekan Terakhir",
      filters: {
        allPositions: "Semua Posisi",
        allDepartments: "Semua Departemen",
        allStatuses: "Semua Status",
      },
      empty: "Tidak ada karyawan ditemukan",
      totalChecks: "Total Pengecekan",
      resultsFound: "karyawan ditemukan",
      confirmDelete: "Apakah Anda yakin ingin menghapus karyawan ini?",
      confirmDeleteWithChecks: "Karyawan ini memiliki {count} pengecekan perangkat. Apakah Anda yakin?",
      toast: {
        fetchFailed: "Gagal mengambil data karyawan",
        deleteSuccess: "Karyawan berhasil dihapus",
        deleteFailed: "Gagal menghapus karyawan",
      },
    },
    employeeDetail: {
      title: "Detail Karyawan",
      employeeId: "ID Karyawan",
      backToEmployees: "Kembali ke Karyawan",
      deviceChecks: "Pengecekan Perangkat",
      noChecks: "Tidak ada pengecekan perangkat ditemukan untuk karyawan ini",
      totalChecks: "Total Pengecekan",
    },
    dashboard: {
      title: "Statistik Pengecekan Perangkat",
      description: "Ringkasan data pengecekan perangkat dan tren",
      timeRange: {
        all: "Semua Waktu",
        last30Days: "30 Hari Terakhir",
        last6Months: "6 Bulan Terakhir",
        last1Year: "1 Tahun Terakhir",
      },
      summary: {
        totalChecks: "Total Pengecekan",
        totalEmployees: "Total Karyawan",
        totalPCs: "Total PC",
        totalLaptops: "Total Laptop",
        companyOwned: "Dimiliki Perusahaan",
        personalOwned: "Dimiliki Pribadi",
        urgentDevices: "Perangkat Urgent",
      },
      charts: {
        deviceType: "Distribusi Tipe Perangkat",
        ownership: "Kepemilikan Perangkat",
        suitability: "Kesesuaian Perangkat",
        osType: "Distribusi Sistem Operasi",
        osLicense: "Status Lisensi OS",
        antivirus: "Status Antivirus",
        vpn: "Status VPN",
        trendsOverTime: "Pengecekan Sepanjang Waktu",
        departmentBreakdown: "Ringkasan Departemen",
      },
      urgentDevices: {
        title: "⚠️ Perangkat Urgent",
        noUrgent: "Tidak ada perangkat urgent ditemukan",
        viewDetails: "Lihat Detail",
        needsRepair: "Perlu Perbaikan",
        unsuitable: "Tidak Sesuai",
      },
      toast: {
        fetchFailed: "Gagal mengambil statistik",
      },
    },
    employeeHistory: {
      title: "Riwayat Karyawan",
      fetchFailed: "Gagal mengambil riwayat karyawan",
      notFound: "Karyawan tidak ditemukan",
      loading: "Memuat riwayat karyawan...",
      goBack: "Kembali",
      addNewCheck: "Tambah Pengecekan Baru",
      confirmDelete:
        "Apakah Anda yakin ingin menghapus pengecekan perangkat ini?",
      toast: {
        deleteSuccess: "Pengecekan perangkat berhasil dihapus",
        deleteFailed: "Gagal menghapus pengecekan perangkat",
        pdfGenerating: "Membuat PDF...",
        pdfSuccess: "PDF berhasil diunduh",
        pdfFailed: "Gagal membuat PDF",
      },
    },
    createEmployee: {
      title: "Tambah Karyawan Baru",
      description:
        "Tambahkan karyawan baru ke sistem. Ini akan memungkinkan Anda membuat pengecekan perangkat untuk mereka.",
      formTitle: "Informasi Karyawan",
      formDescription:
        "Isi bidang wajib ditandai dengan *. Informasi kontak dan status adalah opsional.",
      firstName: "Nama Depan",
      lastName: "Nama Belakang",
      position: "Posisi",
      department: "Departemen",
      email: "Email",
      phoneNumber: "Nomor Telepon",
      status: "Status",
      statusOptions: {
        active: "Aktif",
        inactive: "Tidak Aktif",
        resigned: "Mengundurkan Diri",
      },
      required: "*",
      placeholders: {
        employeeId: "Masukkan id karyawan",
        firstName: "Masukkan nama depan",
        lastName: "Masukkan nama belakang",
        position: "cth: Software Engineer",
        department: "cth: IT, HR, Pemasaran",
        email: "cth: john.doe@perusahaan.com",
        phoneNumber: "cth: +62 812 3456 7890",
      },
      backToEmployees: "Kembali ke Karyawan",
      cancel: "Batal",
      createButton: "Tambah Karyawan",
      creating: "Membuat...",
      employeeIdHint: "Kosongkan untuk pembuatan otomatis.",
      validation: {
        requiredFields: "Silakan isi semua bidang wajib",
        createSuccess: "Karyawan berhasil ditambahkan",
        createFailed: "Gagal menambahkan karyawan",
      },
    },
    errors: {
      generic: "Terjadi kesalahan",
      network: "Error jaringan. Silakan periksa koneksi Anda",
      notFound: "Sumber daya tidak ditemukan",
    },
  },
};

export const defaultLanguage: Language = "id";
