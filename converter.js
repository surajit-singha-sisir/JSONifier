// Helper to parse strings, returning null if empty
function parseString(val) {
  if (val === undefined || val === null) return null;
  const s = val.trim();
  return s === '' ? null : s;
}

// Helper to parse integers, returning null if empty or NaN
function parseIntVal(val) {
  if (val === undefined || val === null) return null;
  const s = val.trim();
  if (s === '') return null;
  const parsed = parseInt(s.replace(/,/g, ''), 10);
  return isNaN(parsed) ? null : parsed;
}

// Robust date formatting as described
function formatTemplateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  dateStr = dateStr.trim();
  if (dateStr === '') return null;
  
  // If it's already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // If it matches DD/MM/YYYY or D/M/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);
    const p3 = parseInt(parts[2], 10);
    
    // Check if it's YYYY/MM/DD (e.g. 2019/01/11)
    if (p1 > 1000) {
      const y = p1;
      const m = String(p2).padStart(2, '0');
      const d = String(p3).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    
    // Check if p1 (month candidate) is <= 12
    if (p1 >= 1 && p1 <= 12) {
      const y = p3;
      const m = String(p1).padStart(2, '0');
      const d = String(p2).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  
  return dateStr;
}

function convertMarkdownToSchoolJson(mdContent) {
  // Parse all markdown tables
  const lines = mdContent.split(/\r?\n/);
  const tables = [];
  let currentTable = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim());
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();

      const isSeparator = cells.every(c => c.startsWith('-') || /^[:\-\s]+$/.test(c));

      if (isSeparator) {
        if (currentTable) {
          currentTable.hasSeparator = true;
        }
        continue;
      }

      if (!currentTable) {
        currentTable = {
          header: cells,
          rows: [],
          hasSeparator: false
        };
      } else {
        currentTable.rows.push(cells);
      }
    } else {
      if (currentTable) {
        tables.push(currentTable);
        currentTable = null;
      }
    }
  }
  if (currentTable) {
    tables.push(currentTable);
  }

  // Compile global key-value map from all Column_X style tables
  const kvMap = {};
  for (const table of tables) {
    if (table.header[0] && table.header[0].startsWith('Column_')) {
      for (const row of table.rows) {
        if (row.length >= 2) {
          const k1 = row[0].trim();
          const v1 = row[1].trim();
          if (k1 && !k1.startsWith('http')) {
            kvMap[k1] = v1;
          }
        }
        if (row.length >= 4) {
          const k2 = row[2].trim();
          const v2 = row[3].trim();
          if (k2 && !k2.startsWith('http')) {
            kvMap[k2] = v2;
          }
        }
      }
    }
  }

  // Extracted structures
  let recognition_history = [];
  let mpo_info = [];
  let bank_accounts = [];
  let committee_members = [];
  let former_committee_members = [];
  let staff_positions = [];
  let staff_positions_total = {
    currently_working_total: null,
    currently_working_male: null,
    currently_working_female: null,
    mpo_total: null,
    mpo_male: null,
    mpo_female: null,
    vacant_post: null,
    branch_post: null
  };
  let development_projects = [];

  for (const table of tables) {
    const headerStr = table.header.join(' ');

    // 1. Recognition History
    if (headerStr.includes('প্রথম স্বীকৃতির তারিখ') || headerStr.includes('স্বীকৃতিপ্রাপ্ত স্তর')) {
      if (!table.header[0].startsWith('Column_')) {
        for (const row of table.rows) {
          if (row.length >= 2) {
            recognition_history.push({
              level: parseString(row[0]),
              first_recognition_date: formatTemplateDate(row[1]),
              latest_recognition_expiry_date: row[2] ? formatTemplateDate(row[2]) : null
            });
          }
        }
      }
    }
    // 2. MPO Info
    else if (headerStr.includes('এমপিওভুক্তির তারিখ') || headerStr.includes('এমপিও কোড')) {
      if (!table.header[0].startsWith('Column_')) {
        for (const row of table.rows) {
          if (row.length >= 2) {
            mpo_info.push({
              level: parseString(row[0]),
              mpo_date: formatTemplateDate(row[1]),
              mpo_code: parseIntVal(row[2])
            });
          }
        }
      }
    }
    // 3. Bank Accounts
    else if (headerStr.includes('ব্যাংক') && headerStr.includes('হিসাব নম্বর') && headerStr.includes('হিসাবের উদ্দেশ্য')) {
      for (const row of table.rows) {
        if (row.length >= 7) {
          bank_accounts.push({
            serial_no: parseIntVal(row[0]),
            bank_name: parseString(row[1]),
            branch: parseString(row[2]),
            account_type: parseString(row[3]),
            account_holder_name: parseString(row[4]),
            account_number: parseIntVal(row[5]),
            account_purpose: parseString(row[6])
          });
        }
      }
    }
    // 4. Committee Members
    else if (headerStr.includes('সদস্যের নাম') && headerStr.includes('যোগদানের তারিখ') && headerStr.includes('কমিটিতে অবস্থান')) {
      for (const row of table.rows) {
        if (row.length >= 12) {
          committee_members.push({
            serial_no: parseIntVal(row[0]),
            member_name: parseString(row[1]),
            joining_date: row[2] ? formatTemplateDate(row[2]) : null,
            leaving_date: row[3] ? formatTemplateDate(row[3]) : null,
            phone: parseIntVal(row[4]),
            trainings_received_count: parseIntVal(row[5]),
            gender: parseString(row[6]),
            committee_position: parseString(row[7]),
            education_qualification: parseString(row[8]),
            occupation: parseString(row[9]),
            left_committee: parseString(row[10]),
            reason_for_leaving: parseString(row[11])
          });
        }
      }
    }
    // 5. Former Committee Members
    else if (headerStr.includes('সদস্যের নাম') && headerStr.includes('ত্যাগের কারণ') && table.header.length <= 6) {
      for (const row of table.rows) {
        if (row.length >= 5) {
          former_committee_members.push({
            serial_no: parseIntVal(row[0]),
            member_name: parseString(row[1]),
            gender: parseString(row[2]),
            phone: parseIntVal(row[3]),
            reason_for_leaving: parseString(row[4])
          });
        }
      }
    }
    // 6. Staff Positions
    else if (headerStr.includes('পদবি') && headerStr.includes('বর্তমানে কাজ করতেছে') && headerStr.includes('শূন্যপদ')) {
      for (const row of table.rows) {
        if (row.length >= 9) {
          const isTotal = row[0].includes('মোট') || row[0].includes('Total');
          if (isTotal) {
            staff_positions_total = {
              currently_working_total: parseIntVal(row[1]),
              currently_working_male: parseIntVal(row[2]),
              currently_working_female: parseIntVal(row[3]),
              mpo_total: parseIntVal(row[4]),
              mpo_male: parseIntVal(row[5]),
              mpo_female: parseIntVal(row[6]),
              vacant_post: parseIntVal(row[7]),
              branch_post: parseIntVal(row[8])
            };
          } else {
            staff_positions.push({
              serial_no: parseIntVal(row[0]),
              designation: parseString(row[1]),
              currently_working_total: parseIntVal(row[2]),
              currently_working_male: parseIntVal(row[3]),
              currently_working_female: parseIntVal(row[4]),
              mpo_total: parseIntVal(row[5]),
              mpo_male: parseIntVal(row[6]),
              mpo_female: parseIntVal(row[7]),
              vacant_post: parseIntVal(row[8]),
              branch_post: parseIntVal(row[9])
            });
          }
        }
      }
    }
    // 7. Development Projects
    else if (headerStr.includes('কাজের ধরন') && headerStr.includes('প্রকল্পের নাম')) {
      for (const row of table.rows) {
        if (row.length >= 10) {
          development_projects.push({
            serial_no: parseIntVal(row[0]),
            work_type: parseString(row[1]),
            description: parseString(row[2]),
            progress: parseString(row[3]),
            start_date: formatTemplateDate(row[4]),
            duration_months: parseIntVal(row[5]),
            end_date: formatTemplateDate(row[6]),
            total_allocated_cost_taka: parseIntVal(row[7]),
            funding_source: parseString(row[8]),
            project_name: parseString(row[9])
          });
        }
      }
    }
  }

  // Construct the school details object precisely as required by the school_new.json template
  const school = {
    institute_name_bn: parseString(kvMap['প্রতিষ্ঠানের নাম (বাংলায়)']),
    institute_name_en: parseString(kvMap['ইংরেজীতে নাম (ব্লক লেটার)']),
    address: {
      village_road_holding_no: parseString(kvMap['গ্রাম/হোল্ডি নম্বর/রোড']),
      union: parseString(kvMap['ইউনিয়ন']),
      mouza_name: parseString(kvMap['মূলভবনের মৌজার নাম']),
      plot_dag_number: parseIntVal(kvMap['মূল ভবনের দাগ নম্বর']),
      post_office: parseString(kvMap['ডাকঘর']),
      post_code: parseIntVal(kvMap['পোস্ট কোড']),
      upazila_thana: parseString(kvMap['উপজেলা/থানা']),
      district: parseString(kvMap['জেলা']),
      division_region: parseString(kvMap['অঞ্চল'])
    },
    contact: {
      institute_phone: parseIntVal(kvMap['প্রতিষ্ঠানের ফোন']),
      head_of_institute_mobile: parseIntVal(kvMap['মোবাইল (প্রতিষ্ঠান প্রধান)']),
      fax: parseString(kvMap['ফ্যাক্স']),
      institute_email: parseString(kvMap['প্রতিষ্ঠানের ই-মেইল']),
      website: parseString(kvMap['ওয়েব এড্রেস'])
    },
    founder_name: parseString(kvMap['প্রতিষ্ঠাতা']),
    head_of_institute_name: parseString(kvMap['প্রতিষ্ঠান প্রধানের নাম']),
    parliamentary_constituency: parseString(kvMap['সংসদীয় আসন (নির্বাচনক্ষেত্র)']),
    establishment_date: parseString(kvMap['প্রতিষ্ঠার তারিখ']),
    classification: {
      institute_type: parseString(kvMap['প্রতিষ্ঠানের প্রকার']),
      attached_technical_branch_type: parseString(kvMap['সংযুক্ত কারিগরি শাখার ধরন']),
      group: parseString(kvMap['গ্রুপ']),
      student_type: parseString(kvMap['কাদের জন্য']),
      shift_count: parseString(kvMap['শিফট সংখ্যা']),
      has_english_version: parseString(kvMap['ইংরেজি ভার্সন আছে কিনা ?']),
      management: parseString(kvMap['ব্যবস্থাপনা']),
      recognition_status: parseString(kvMap['স্বীকৃতি/অনুমোদিত']),
      recognized_level: parseString(kvMap['স্বীকৃতিপ্রাপ্ত স্তর'])
    },
    recognition_history: recognition_history,
    mpo_info: mpo_info,
    bank_accounts: bank_accounts,
    committee_members: committee_members,
    staff_positions: staff_positions,
    staff_positions_total: staff_positions_total,
    former_committee_members: former_committee_members,
    development_projects: development_projects
  };

  return {
    school_data: [school]
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { convertMarkdownToSchoolJson, formatTemplateDate };
}
