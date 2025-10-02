import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ImportedParticipant {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
}

export async function parseCSV(file: File): Promise<ImportedParticipant[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        try {
          const participants = results.data.map((row: any) => {
            const firstName = row['prénom'] || row['prenom'] || row['first name'] || row['firstname'] || '';
            const lastName = row['nom'] || row['last name'] || row['lastname'] || '';
            const company = row['entreprise'] || row['company'] || row['société'] || row['societe'] || '';
            const email = row['email'] || row['e-mail'] || row['mail'] || '';

            if (!firstName || !lastName) {
              throw new Error('Colonnes requises manquantes: Prénom et Nom');
            }

            if (!email) {
              throw new Error('Colonne Email requise pour garantir l\'unicité des participants');
            }

            return {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              company: company.trim(),
              email: email.trim().toLowerCase(),
            };
          });

          resolve(participants);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Erreur de parsing CSV: ${error.message}`));
      },
    });
  });
}

export async function parseExcel(file: File): Promise<ImportedParticipant[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { raw: false });

        const participants = jsonData.map((row: any) => {
          const values: any = {};

          Object.keys(row).forEach((key) => {
            values[key.toLowerCase().trim()] = row[key];
          });

          const firstName =
            values['prénom'] ||
            values['prenom'] ||
            values['first name'] ||
            values['firstname'] ||
            '';
          const lastName =
            values['nom'] ||
            values['last name'] ||
            values['lastname'] ||
            '';
          const company =
            values['entreprise'] ||
            values['company'] ||
            values['société'] ||
            values['societe'] ||
            '';
          const email =
            values['email'] ||
            values['e-mail'] ||
            values['mail'] ||
            '';

          if (!firstName || !lastName) {
            throw new Error('Colonnes requises manquantes: Prénom et Nom');
          }

          if (!email) {
            throw new Error('Colonne Email requise pour garantir l\'unicité des participants');
          }

          return {
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            company: String(company).trim(),
            email: String(email).trim().toLowerCase(),
          };
        });

        resolve(participants);
      } catch (error: any) {
        reject(new Error(`Erreur de parsing Excel: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur de lecture du fichier'));
    };

    reader.readAsBinaryString(file);
  });
}

export async function parseFile(file: File): Promise<ImportedParticipant[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    return parseCSV(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file);
  } else {
    throw new Error('Format de fichier non supporté. Utilisez CSV ou Excel (.xlsx, .xls)');
  }
}
