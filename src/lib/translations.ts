export type Language = 'en' | 'id';

export interface Translations {
  common: {
    loading: string;
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
  };
  header: {
    title: string;
    form: string;
    checkData: string;
    employeeData: string;
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
    };
    toast: {
      createSuccess: string;
      createFailed: string;
      selectEmployee: string;
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
    confirmDelete: string;
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
    statusOptions: {
      active: string;
      inactive: string;
      resigned: string;
    };
    required: string;
    placeholders: {
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
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      download: 'Download',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      yes: 'Yes',
      no: 'No',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      add: 'Add',
      remove: 'Remove',
    },
    header: {
      title: 'Device Checking System',
      form: 'Form',
      checkData: 'Check Data',
      employeeData: 'Employee Data',
      toggleTheme: 'Toggle theme',
      toggleLanguage: 'Toggle language',
    },
    home: {
      welcome: 'Welcome to Device Checking System',
      description: 'Manage device checking records efficiently',
    },
    form: {
      title: 'Device Checking Form',
      description: 'Fill in device checking information below',
      sections: {
        employee: 'Employee',
        deviceDetail: 'Device Detail',
        operatingSystem: 'Operating System',
        specification: 'Specification',
        deviceCondition: 'Device Condition',
        applications: 'Applications',
        security: 'Security',
        additionalInfo: 'Additional Info',
      },
      formSections: 'Form Sections',
      employeeInfo: {
        title: 'Employee Information',
        fullName: 'Full Name',
        employeeId: 'Employee ID',
        position: 'Position',
        department: 'Department',
        totalChecks: 'Total Checks',
        selectEmployee: 'Select an employee',
        checkDate: 'Check Date',
        checkDatePlaceholder: 'Select check date',
      },
      deviceDetail: {
        title: 'Device Detail',
        deviceType: 'Device Type',
        ownership: 'Ownership',
        deviceBrand: 'Device Brand',
        deviceModel: 'Device Model',
        serialNumber: 'Serial Number',
        deviceTypeOptions: {
          pc: 'PC',
          laptop: 'Laptop',
        },
        ownershipOptions: {
          company: 'Company',
          personal: 'Personal',
        },
      },
      operatingSystem: {
        title: 'Operating System',
        osType: 'OS Type',
        osVersion: 'OS Version',
        osLicense: 'OS License',
        regularUpdates: 'Regular Updates Enabled',
        osTypeOptions: {
          windows: 'Windows',
          linux: 'Linux',
          mac: 'Mac',
        },
        osLicenseOptions: {
          original: 'Original',
          pirated: 'Pirated',
          openSource: 'Open Source',
          unknown: 'Unknown',
        },
      },
      specification: {
        title: 'Specification (Optional)',
        ramCapacity: 'RAM Capacity',
        memoryType: 'Memory Type',
        storageCapacity: 'Storage Capacity',
        processor: 'Processor',
        memoryTypeOptions: {
          hdd: 'HDD',
          ssd: 'SSD',
        },
      },
      deviceCondition: {
        title: 'Device Condition',
        deviceSuitability: 'Device Suitability',
        battery: 'Battery',
        keyboard: 'Keyboard',
        touchpad: 'Touchpad',
        monitor: 'Monitor',
        wifi: 'WiFi',
        suitabilityOptions: {
          suitable: 'Suitable',
          limitedSuitability: 'Limited Suitability',
          needsRepair: 'Needs Repair',
          unsuitable: 'Unsuitable',
        },
      },
      applications: {
        title: 'Applications',
        workApplications: 'Work Applications',
        nonWorkApplications: 'Non-Work Applications',
        applicationName: 'Application name',
        license: 'License',
        notes: 'Notes',
        licenseOptions: {
          original: 'Original',
          pirated: 'Pirated',
          openSource: 'Open Source',
          unknown: 'Unknown',
        },
        notesPlaceholder: 'Notes (optional)',
      },
      security: {
        title: 'Security',
        antivirus: 'Antivirus Software',
        vpn: 'VPN Software',
        status: 'Status',
        statusOptions: {
          active: 'Active',
          inactive: 'Inactive',
          available: 'Available',
          notAvailable: 'Not Available',
        },
      },
      additionalInfo: {
        title: 'Additional Information',
        passwordUsage: 'Password Usage',
        inspectorPICName: 'Inspector PIC Name',
        otherNotes: 'Other Notes',
        passwordUsageOptions: {
          available: 'Available',
          notAvailable: 'Not Available',
        },
        otherNotesPlaceholder: 'Enter any additional notes...',
      },
      validation: {
        employeeRequired: 'Please select an employee',
        checkDateRequired: 'Check date is required',
        deviceTypeRequired: 'Device type is required',
        ownershipRequired: 'Ownership is required',
        deviceBrandRequired: 'Device brand is required',
        deviceModelRequired: 'Device model is required',
        serialNumberRequired: 'Serial number is required',
        osTypeRequired: 'OS type is required',
        osVersionRequired: 'OS version is required',
        osLicenseRequired: 'OS license is required',
        deviceSuitabilityRequired: 'Device suitability is required',
        passwordUsageRequired: 'Password usage is required',
      },
      toast: {
        createSuccess: 'Device check created successfully',
        createFailed: 'Failed to create device check',
        selectEmployee: 'Please select an employee',
        optionAdded: 'added successfully',
        optionSaveFailed: 'Failed to save option to database',
      },
      placeholders: {
        deviceBrand: 'Select or create device brand...',
        deviceModel: '',
        serialNumber: '',
        osVersion: 'e.g., Windows 11, Ubuntu 22.04, macOS Sonoma',
        ramCapacity: 'Select or create RAM capacity...',
        storageCapacity: 'Select or create storage capacity...',
        processor: 'Select or create processor...',
        battery: 'e.g., Good, Fair, Poor',
        keyboard: 'e.g., Good, Fair, Poor',
        touchpad: 'e.g., Good, Fair, Poor',
        monitor: 'e.g., Good, Fair, Poor',
        wifi: 'e.g., Good, Fair, Poor',
        applicationName: 'e.g., Microsoft Office, Adobe Reader',
        notes: 'Notes (optional)',
        inspectorName: 'Select or create inspector name...',
        otherNotes: 'Enter any additional notes...',
      },
    },
    checkData: {
      title: 'Device Check Data',
      description: 'View and manage all device checking records',
      filters: {
        searchPlaceholder: 'Search by employee name, employee id, device brand or model...',
        allConditions: 'All Conditions',
        allOwnership: 'All Ownership',
        clearFilters: 'Clear Filters',
        groupByEmployee: 'Group by Employee',
      },
      empty: 'No device checks found',
      buttons: {
        viewAllHistory: 'View All History',
        viewAllChecks: 'View all {count} checks',
      },
      badge: {
        total: 'Total: {count} checks',
      },
      suitability: {
        suitable: 'Suitable',
        limitedSuitability: 'Limited Suitability',
        needsRepair: 'Needs Repair',
        unsuitable: 'Unsuitable',
      },
      confirmDelete: 'Are you sure you want to delete this device check?',
      toast: {
        fetchFailed: 'Failed to fetch device checks',
        deleteSuccess: 'Device check deleted successfully',
        deleteFailed: 'Failed to delete device check',
        pdfGenerating: 'Generating PDF...',
        pdfSuccess: 'PDF downloaded successfully',
        pdfFailed: 'Failed to generate PDF',
      },
      summary: {
        totalChecks: 'Total Checks',
        pcDevices: 'PC Devices',
        laptops: 'Laptops',
        companyOwned: 'Company Owned',
      },
      checkHistory: 'Check History',
      exportAll: 'Export All',
      noChecks: 'No device checks found',
    },
    employee: {
      title: 'Employee Data',
      description: 'View and manage all employee records',
      addButton: 'Add Employee',
      searchPlaceholder: 'Search by name, position, or ID...',
      employeeId: 'Employee ID',
      department: 'Department',
      lastCheck: 'Last Check',
      filters: {
        allPositions: 'All Positions',
        allDepartments: 'All Departments',
        allStatuses: 'All Statuses',
      },
      empty: 'No employees found',
      totalChecks: 'Total Checks',
      confirmDelete: 'Are you sure you want to delete this employee?',
      toast: {
        fetchFailed: 'Failed to fetch employees',
        deleteSuccess: 'Employee deleted successfully',
        deleteFailed: 'Failed to delete employee',
      },
    },
    employeeDetail: {
      title: 'Employee Details',
      employeeId: 'Employee ID',
      backToEmployees: 'Back to Employees',
      deviceChecks: 'Device Checks',
      noChecks: 'No device checks found for this employee',
      totalChecks: 'Total Checks',
    },
    employeeHistory: {
      title: 'Employee History',
      fetchFailed: 'Failed to fetch employee history',
      notFound: 'Employee not found',
      loading: 'Loading employee history...',
      goBack: 'Go Back',
      addNewCheck: 'Add New Check',
      confirmDelete: 'Are you sure you want to delete this device check?',
      toast: {
        deleteSuccess: 'Device check deleted successfully',
        deleteFailed: 'Failed to delete device check',
        pdfGenerating: 'Generating PDF...',
        pdfSuccess: 'PDF downloaded successfully',
        pdfFailed: 'Failed to generate PDF',
      },
    },
    createEmployee: {
      title: 'Create New Employee',
      description: 'Add a new employee to the system. This will allow you to create device checks for them.',
      formTitle: 'Employee Information',
      formDescription: 'Fill in required fields marked with *. Contact information and status are optional.',
      firstName: 'First Name',
      lastName: 'Last Name',
      position: 'Position',
      department: 'Department',
      email: 'Email',
      phoneNumber: 'Phone Number',
      status: 'Status',
      statusOptions: {
        active: 'Active',
        inactive: 'Inactive',
        resigned: 'Resigned',
      },
      required: '*',
      placeholders: {
        firstName: 'Enter first name',
        lastName: 'Enter last name',
        position: 'e.g., Software Engineer',
        department: 'e.g., IT, HR, Marketing',
        email: 'e.g., john.doe@company.com',
        phoneNumber: 'e.g., +62 812 3456 7890',
      },
      backToEmployees: 'Back to Employees',
      cancel: 'Cancel',
      createButton: 'Create Employee',
      creating: 'Creating...',
      validation: {
        requiredFields: 'Please fill in all required fields',
        createSuccess: 'Employee created successfully',
        createFailed: 'Failed to create employee',
      },
    },
    errors: {
      generic: 'An error occurred',
      network: 'Network error. Please check your connection',
      notFound: 'Resource not found',
    },
  },
  id: {
    common: {
      loading: 'Memuat...',
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Edit',
      view: 'Lihat',
      download: 'Unduh',
      search: 'Cari',
      filter: 'Filter',
      clear: 'Hapus',
      yes: 'Ya',
      no: 'Tidak',
      submit: 'Kirim',
      back: 'Kembali',
      next: 'Lanjut',
      add: 'Tambah',
      remove: 'Hapus',
    },
    header: {
      title: 'Sistem Pengecekan Perangkat',
      form: 'Formulir',
      checkData: 'Data Pengecekan',
      employeeData: 'Data Karyawan',
      toggleTheme: 'Ganti tema',
      toggleLanguage: 'Ganti bahasa',
    },
    home: {
      welcome: 'Selamat datang di Sistem Pengecekan Perangkat',
      description: 'Kelola data pengecekan perangkat dengan efisien',
    },
    form: {
      title: 'Formulir Pengecekan Perangkat',
      description: 'Isi informasi pengecekan perangkat di bawah ini',
      sections: {
        employee: 'Karyawan',
        deviceDetail: 'Detail Perangkat',
        operatingSystem: 'Sistem Operasi',
        specification: 'Spesifikasi',
        deviceCondition: 'Kondisi Perangkat',
        applications: 'Aplikasi',
        security: 'Keamanan',
        additionalInfo: 'Info Tambahan',
      },
      formSections: 'Bagian Formulir',
      employeeInfo: {
        title: 'Informasi Karyawan',
        fullName: 'Nama Lengkap',
        employeeId: 'ID Karyawan',
        position: 'Posisi',
        department: 'Departemen',
        totalChecks: 'Total Pengecekan',
        selectEmployee: 'Pilih karyawan',
        checkDate: 'Tanggal Pengecekan',
        checkDatePlaceholder: 'Pilih tanggal pengecekan',
      },
      deviceDetail: {
        title: 'Detail Perangkat',
        deviceType: 'Tipe Perangkat',
        ownership: 'Kepemilikan',
        deviceBrand: 'Merk Perangkat',
        deviceModel: 'Model Perangkat',
        serialNumber: 'Nomor Seri',
        deviceTypeOptions: {
          pc: 'PC',
          laptop: 'Laptop',
        },
        ownershipOptions: {
          company: 'Perusahaan',
          personal: 'Pribadi',
        },
      },
      operatingSystem: {
        title: 'Sistem Operasi',
        osType: 'Tipe OS',
        osVersion: 'Versi OS',
        osLicense: 'Lisensi OS',
        regularUpdates: 'Update Berkala Diaktifkan',
        osTypeOptions: {
          windows: 'Windows',
          linux: 'Linux',
          mac: 'Mac',
        },
        osLicenseOptions: {
          original: 'Original',
          pirated: 'Bajakan',
          openSource: 'Open Source',
          unknown: 'Tidak Diketahui',
        },
      },
      specification: {
        title: 'Spesifikasi (Opsional)',
        ramCapacity: 'Kapasitas RAM',
        memoryType: 'Tipe Memori',
        storageCapacity: 'Kapasitas Penyimpanan',
        processor: 'Prosesor',
        memoryTypeOptions: {
          hdd: 'HDD',
          ssd: 'SSD',
        },
      },
      deviceCondition: {
        title: 'Kondisi Perangkat',
        deviceSuitability: 'Kesesuaian Perangkat',
        battery: 'Baterai',
        keyboard: 'Keyboard',
        touchpad: 'Touchpad',
        monitor: 'Monitor',
        wifi: 'WiFi',
        suitabilityOptions: {
          suitable: 'Sesuai',
          limitedSuitability: 'Sesuai Terbatas',
          needsRepair: 'Perlu Perbaikan',
          unsuitable: 'Tidak Sesuai',
        },
      },
      applications: {
        title: 'Aplikasi',
        workApplications: 'Aplikasi Kerja',
        nonWorkApplications: 'Aplikasi Non-Kerja',
        applicationName: 'Nama aplikasi',
        license: 'Lisensi',
        notes: 'Catatan',
        licenseOptions: {
          original: 'Original',
          pirated: 'Bajakan',
          openSource: 'Open Source',
          unknown: 'Tidak Diketahui',
        },
        notesPlaceholder: 'Catatan (opsional)',
      },
      security: {
        title: 'Keamanan',
        antivirus: 'Perangkat Lunak Antivirus',
        vpn: 'Perangkat Lunak VPN',
        status: 'Status',
        statusOptions: {
          active: 'Aktif',
          inactive: 'Tidak Aktif',
          available: 'Tersedia',
          notAvailable: 'Tidak Tersedia',
        },
      },
      additionalInfo: {
        title: 'Informasi Tambahan',
        passwordUsage: 'Penggunaan Password',
        inspectorPICName: 'Nama PIC Pemeriksa',
        otherNotes: 'Catatan Lainnya',
        passwordUsageOptions: {
          available: 'Tersedia',
          notAvailable: 'Tidak Tersedia',
        },
        otherNotesPlaceholder: 'Masukkan catatan tambahan...',
      },
      validation: {
        employeeRequired: 'Silakan pilih karyawan',
        checkDateRequired: 'Tanggal pengecekan wajib diisi',
        deviceTypeRequired: 'Tipe perangkat wajib diisi',
        ownershipRequired: 'Kepemilikan wajib diisi',
        deviceBrandRequired: 'Merk perangkat wajib diisi',
        deviceModelRequired: 'Model perangkat wajib diisi',
        serialNumberRequired: 'Nomor seri wajib diisi',
        osTypeRequired: 'Tipe OS wajib diisi',
        osVersionRequired: 'Versi OS wajib diisi',
        osLicenseRequired: 'Lisensi OS wajib diisi',
        deviceSuitabilityRequired: 'Kesesuaian perangkat wajib diisi',
        passwordUsageRequired: 'Penggunaan password wajib diisi',
      },
      toast: {
        createSuccess: 'Pengecekan perangkat berhasil dibuat',
        createFailed: 'Gagal membuat pengecekan perangkat',
        selectEmployee: 'Silakan pilih karyawan',
        optionAdded: 'berhasil ditambahkan',
        optionSaveFailed: 'Gagal menyimpan opsi ke database',
      },
      placeholders: {
        deviceBrand: 'Pilih atau buat merk perangkat...',
        deviceModel: '',
        serialNumber: '',
        osVersion: 'cth: Windows 11, Ubuntu 22.04, macOS Sonoma',
        ramCapacity: 'Pilih atau buat kapasitas RAM...',
        storageCapacity: 'Pilih atau buat kapasitas penyimpanan...',
        processor: 'Pilih atau buat prosesor...',
        battery: 'cth: Baik, Cukup, Buruk',
        keyboard: 'cth: Baik, Cukup, Buruk',
        touchpad: 'cth: Baik, Cukup, Buruk',
        monitor: 'cth: Baik, Cukup, Buruk',
        wifi: 'cth: Baik, Cukup, Buruk',
        applicationName: 'cth: Microsoft Office, Adobe Reader',
        notes: 'Catatan (opsional)',
        inspectorName: 'Pilih atau buat nama pemeriksa...',
        otherNotes: 'Masukkan catatan tambahan...',
      },
    },
    checkData: {
      title: 'Data Pengecekan Perangkat',
      description: 'Lihat dan kelola semua catatan pengecekan perangkat',
      filters: {
        searchPlaceholder: 'Cari berdasarkan nama karyawan, id karyawan, merk atau model perangkat...',
        allConditions: 'Semua Kondisi',
        allOwnership: 'Semua Kepemilikan',
        clearFilters: 'Hapus Filter',
        groupByEmployee: 'Kelompokkan Berdasarkan Karyawan',
      },
      empty: 'Tidak ada pengecekan perangkat ditemukan',
      buttons: {
        viewAllHistory: 'Lihat Semua Riwayat',
        viewAllChecks: 'Lihat semua {count} pengecekan',
      },
      badge: {
        total: 'Total: {count} pengecekan',
      },
      suitability: {
        suitable: 'Sesuai',
        limitedSuitability: 'Sesuai Terbatas',
        needsRepair: 'Perlu Perbaikan',
        unsuitable: 'Tidak Sesuai',
      },
      confirmDelete: 'Apakah Anda yakin ingin menghapus pengecekan perangkat ini?',
      toast: {
        fetchFailed: 'Gagal mengambil data pengecekan perangkat',
        deleteSuccess: 'Pengecekan perangkat berhasil dihapus',
        deleteFailed: 'Gagal menghapus pengecekan perangkat',
        pdfGenerating: 'Membuat PDF...',
        pdfSuccess: 'PDF berhasil diunduh',
        pdfFailed: 'Gagal membuat PDF',
      },
      summary: {
        totalChecks: 'Total Pengecekan',
        pcDevices: 'Perangkat PC',
        laptops: 'Laptop',
        companyOwned: 'Dimiliki Perusahaan',
      },
      checkHistory: 'Riwayat Pengecekan',
      exportAll: 'Ekspor Semua',
      noChecks: 'Tidak ada pengecekan perangkat ditemukan',
    },
    employee: {
      title: 'Data Karyawan',
      description: 'Lihat dan kelola semua catatan karyawan',
      addButton: 'Tambah Karyawan',
      searchPlaceholder: 'Cari berdasarkan nama, posisi, atau ID...',
      employeeId: 'ID Karyawan',
      department: 'Departemen',
      lastCheck: 'Pengecekan Terakhir',
      filters: {
        allPositions: 'Semua Posisi',
        allDepartments: 'Semua Departemen',
        allStatuses: 'Semua Status',
      },
      empty: 'Tidak ada karyawan ditemukan',
      totalChecks: 'Total Pengecekan',
      confirmDelete: 'Apakah Anda yakin ingin menghapus karyawan ini?',
      toast: {
        fetchFailed: 'Gagal mengambil data karyawan',
        deleteSuccess: 'Karyawan berhasil dihapus',
        deleteFailed: 'Gagal menghapus karyawan',
      },
    },
    employeeDetail: {
      title: 'Detail Karyawan',
      employeeId: 'ID Karyawan',
      backToEmployees: 'Kembali ke Karyawan',
      deviceChecks: 'Pengecekan Perangkat',
      noChecks: 'Tidak ada pengecekan perangkat ditemukan untuk karyawan ini',
      totalChecks: 'Total Pengecekan',
    },
    employeeHistory: {
      title: 'Riwayat Karyawan',
      fetchFailed: 'Gagal mengambil riwayat karyawan',
      notFound: 'Karyawan tidak ditemukan',
      loading: 'Memuat riwayat karyawan...',
      goBack: 'Kembali',
      addNewCheck: 'Tambah Pengecekan Baru',
      confirmDelete: 'Apakah Anda yakin ingin menghapus pengecekan perangkat ini?',
      toast: {
        deleteSuccess: 'Pengecekan perangkat berhasil dihapus',
        deleteFailed: 'Gagal menghapus pengecekan perangkat',
        pdfGenerating: 'Membuat PDF...',
        pdfSuccess: 'PDF berhasil diunduh',
        pdfFailed: 'Gagal membuat PDF',
      },
    },
    createEmployee: {
      title: 'Tambah Karyawan Baru',
      description: 'Tambahkan karyawan baru ke sistem. Ini akan memungkinkan Anda membuat pengecekan perangkat untuk mereka.',
      formTitle: 'Informasi Karyawan',
      formDescription: 'Isi bidang wajib ditandai dengan *. Informasi kontak dan status adalah opsional.',
      firstName: 'Nama Depan',
      lastName: 'Nama Belakang',
      position: 'Posisi',
      department: 'Departemen',
      email: 'Email',
      phoneNumber: 'Nomor Telepon',
      status: 'Status',
      statusOptions: {
        active: 'Aktif',
        inactive: 'Tidak Aktif',
        resigned: 'Mengundurkan Diri',
      },
      required: '*',
      placeholders: {
        firstName: 'Masukkan nama depan',
        lastName: 'Masukkan nama belakang',
        position: 'cth: Software Engineer',
        department: 'cth: IT, HR, Pemasaran',
        email: 'cth: john.doe@perusahaan.com',
        phoneNumber: 'cth: +62 812 3456 7890',
      },
      backToEmployees: 'Kembali ke Karyawan',
      cancel: 'Batal',
      createButton: 'Tambah Karyawan',
      creating: 'Membuat...',
      validation: {
        requiredFields: 'Silakan isi semua bidang wajib',
        createSuccess: 'Karyawan berhasil ditambahkan',
        createFailed: 'Gagal menambahkan karyawan',
      },
    },
    errors: {
      generic: 'Terjadi kesalahan',
      network: 'Error jaringan. Silakan periksa koneksi Anda',
      notFound: 'Sumber daya tidak ditemukan',
    },
  },
};

export const defaultLanguage: Language = 'id';