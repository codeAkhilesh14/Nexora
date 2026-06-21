import { College } from '../models/College.js';

export const collegeCatalog = [
  ['Test College', 'TESTCOLLEGE', ['gmail.com']],
  ['JSS Academy of Technical Education Noida', 'JSSATEN', ['jssaten.ac.in']],
  ['Indian Institute of Technology Delhi', 'IITD', ['iitd.ac.in']],
  ['Delhi Technological University', 'DTU', ['dtu.ac.in']],
  ['Netaji Subhas University of Technology', 'NSUT', ['nsut.ac.in']],
  ['Bennett University', 'BENNETT', ['bennett.edu.in']],
  ['Sharda University', 'SHARDA', ['sharda.ac.in']],
  ['Galgotias University', 'GALGOTIAS', ['galgotiasuniversity.edu.in', 'galgotiasuniversity.ac.in']],
  ['Amity University Noida', 'AMITY', ['amity.edu']],
  ['Indraprastha Institute of Information Technology Delhi', 'IIITD', ['iiitd.ac.in']],
  ['Guru Gobind Singh Indraprastha University', 'GGSIPU', ['ipu.ac.in']]
];

export const syncCollegeCatalog = async () => Promise.all(
  collegeCatalog.map(([name, code, domains]) => College.findOneAndUpdate(
    { code },
    {
      name,
      code,
      domains,
      city: 'Delhi NCR',
      zones: [
        'library',
        'cafeteria',
        'amenities',
        'college_gate',
        'mandir_area',
        'boys_hostel',
        'girls_hostel',
        'field',
        'basketball_court',
        'badminton_court',
        'volleyball_court',
        'first_year_block',
        'amphitheatre',
        'courtyard',
        'parking',
        'placement_cell_office',
        'registrar_office'
      ],
      active: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ))
);
