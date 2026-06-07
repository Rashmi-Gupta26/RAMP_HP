// RAMP Himachal Pradesh — Institute data
// Source: Details_RAMP Centres Proposes by HPCED_ Mandi Distt.xlsx
//
// Wrapped in an IIFE so identifiers like `slug`, `INSTITUTES`, `DISTRICTS`
// don't leak into the shared script scope and collide with the inline
// `const { INSTITUTES, DISTRICTS, slug } = window.RAMP_DATA` destructuring
// used on each page (which would otherwise throw a SyntaxError and prevent
// mountChrome() from running — leaving the page without a header/footer).
(function () {

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const INSTITUTES = [
  // ---------- MANDI ----------
  { cohort: 1, district: 'Mandi', name: 'Abhilashi University',
    agency: 'IIT Mandi Catalyst', participants: 200, faculty: 30, shg: 10,
    website: 'https://www.abhilashiuniversity.ac.in/',
    contact: { name: 'Coordinator, Abhilashi University', phone: '01907-225001', email: 'info@abhilashiuniversity.ac.in' },
    address: 'Chail-Chowk, Mandi, Himachal Pradesh 175028',
    about: 'A multi-disciplinary university supporting RAMP through entrepreneurship workshops, faculty training, and SHG linkage programs.' },

  { cohort: 2, district: 'Mandi', name: 'Govt Industrial Training Institute Dehar',
    agency: 'IIT Mandi Catalyst', participants: 127, faculty: 2,
    website: 'https://www.itidehar.ac.in/',
    contact: { name: 'Principal, ITI Dehar', phone: '+91 9418943264', email: 'itidehar@rediffmail.com' },
    address: 'Village Kot, P.O. Dehar, Tehsil Sunder Nagar, Mandi - 175030',
    about: 'Rural ITI focused on aligning incubation with academic calendars; identified On-the-Job-Training conflicts as a key constraint.' },

  { cohort: 2, district: 'Mandi', name: 'Govt Industrial Training Institute Joginder Nagar',
    agency: 'IIT Mandi Catalyst', participants: 157, faculty: 4,
    website: 'https://www.itijogindernagar.edu.in/',
    contact: { name: 'Principal, ITI Joginder Nagar', phone: '+91 1908 299078', email: 'itijogindernagar@rediffmail.com' },
    address: 'P.O. Jogindernagar, Tehsil Jogindernagar, Mandi - 175001',
    about: 'Engineering and sewing trades focus. 55-seater seminar hall, 25 faculty members. Addresses post-training employment hurdles.' },

  { cohort: 2, district: 'Mandi', name: 'Govt Industrial Training Institute Sandhole',
    agency: 'IIT Mandi Catalyst', participants: 128, faculty: 4,
    contact: { name: 'Principal, ITI Sandhole', phone: '+91 1905-267027', email: 'itisandhole@rediffmail.com' },
    address: 'Sandhole, Tehsil Sandhole, Mandi, Himachal Pradesh',
    about: 'Rural setting where students proposed ventures such as second-hand tire aggregators and e-waste recycling.' },

  { cohort: 2, district: 'Mandi', name: 'Govt Industrial Training Institute Paplog',
    agency: 'IIT Mandi Catalyst', participants: 400, faculty: 26,
    website: 'https://itigovpaplog.edu.in/',
    contact: { name: 'Principal, ITI Paplog', phone: '+91 9816056690', email: 'itipaplog@rediffmail.com' },
    address: 'Paplog, P.O. Sadhot, Tehsil Sarkaghat, Mandi - 175037',
    about: 'Large ITI with 50-seater seminar hall and 26 faculty, supporting 10 trades and 400 students.' },

  // ---------- KULLU ----------
  { cohort: 1, district: 'Kullu', name: 'Govt. ITI Shamshi',
    agency: 'IIT Mandi Catalyst', participants: 100, faculty: 5,
    website: 'https://itishamshi.edu.in/',
    contact: { name: 'Principal, ITI Shamshi', phone: '+91 1902-265152', email: 'itishamshi@rediffmail.com' },
    address: 'Shamshi, Kullu, Himachal Pradesh 175126',
    about: 'Cohort-1 institute training students in core engineering trades with faculty mentorship for venture creation.' },

  { cohort: 2, district: 'Kullu', name: 'Industrial Training Institute (ITI) Sainj',
    agency: 'IIT Mandi Catalyst', participants: 178, faculty: 3,
    website: 'https://itisainj.edu.in/',
    contact: { name: 'Principal, ITI Sainj', phone: '+91 1902-260104', email: 'itisainj@rediffmail.com' },
    address: 'Sainj, Tehsil Banjar, Kullu, Himachal Pradesh 175134',
    about: 'Demonstrated "practicing what you preach" — used digital marketing to increase its own student enrolment.' },

  { cohort: 2, district: 'Kullu', name: 'Government College, Banjar',
    agency: 'IIT Mandi Catalyst', participants: 90, faculty: 2,
    website: 'https://gdcbanjar.edu.in/',
    contact: { name: 'Principal, GDC Banjar', phone: '+91 1903-222253', email: 'principalgdcbanjar@gmail.com' },
    address: 'Banjar, Kullu, Himachal Pradesh 175123',
    about: 'Multi-disciplinary academic streams (Humanities, Science, Commerce) supporting concepts like local pickle kitchens.' },

  { cohort: 2, district: 'Kullu', name: 'Govt. Industrial Training Institute Patlikuhal',
    agency: 'IIT Mandi Catalyst', participants: 186, faculty: 3,
    website: 'https://govtitipatlikuhl.edu.in/',
    contact: { name: 'Principal, ITI Patlikuhal', phone: '+91 1902-240228', email: 'itipatlikuhal@rediffmail.com' },
    address: 'Patlikuhal, Kullu, Himachal Pradesh 175130',
    about: 'Successfully engaged 10 rural Self-Help Groups (SHGs) to link traditional knowledge with business modeling.' },

  // ---------- LAHAUL & SPITI ----------
  { cohort: 1, district: 'Lahaul & Spiti', name: 'Govt. Degree College, Kukumseri',
    agency: 'IIT Mandi Catalyst', participants: 25, faculty: 8,
    website: 'https://gdckukumseri.blogspot.com/',
    contact: { name: 'Principal, GDC Kukumseri', phone: '+91 1900-222232', email: 'principal.gdckukumseri@gmail.com' },
    address: 'Kukumseri, Lahaul & Spiti, Himachal Pradesh 175132',
    about: 'High-altitude degree college using hybrid mentoring to overcome road closures and harsh winters.' },

  { cohort: 2, district: 'Lahaul & Spiti', name: 'Govt. Industrial Training Institute Rong-Tong',
    agency: 'IIT Mandi Catalyst', participants: 58, shgNote: '5 SHGs from Rangrik',
    website: 'http://www.govtitirongtong.org/',
    contact: { name: 'Principal, ITI Rong-Tong', phone: '+91 1906-200052', email: 'itirongtong@rediffmail.com' },
    address: 'Rong-Tong, Kaza, Lahaul & Spiti, Himachal Pradesh 172114',
    about: 'Case study for remote incubation in high-altitude terrains. Engages SHGs from Rangrik.' },

  { cohort: 2, district: 'Lahaul & Spiti', name: 'Govt. Industrial Training Institute Udaipur',
    agency: 'IIT Mandi Catalyst', participants: 209, faculty: 4,
    website: 'http://itiudaipur.org/',
    contact: { name: 'Principal, ITI Udaipur', phone: '+91 1900-252215', email: 'itiudaipur@rediffmail.com' },
    address: 'Udaipur, Lahaul & Spiti, Himachal Pradesh 175142',
    about: 'Standout concepts include an "Instant Low-Cost Cooling Machine" to solve local storage issues.' },

  { cohort: 2, district: 'Lahaul & Spiti', name: 'Govt. ITI Karga',
    agency: 'IIT Mandi Catalyst', participants: 35, faculty: 1, shgNote: '3–4 local participants',
    contact: { name: 'Principal, ITI Karga', phone: '+91 1900-222164', email: 'itikarga@rediffmail.com' },
    address: 'Karga, Lahaul & Spiti, Himachal Pradesh 175132',
    about: 'Aligns the "Moto Mechanic" trade with the local tourism economy (e.g., ATV businesses).' },

  // ---------- SHIMLA ----------
  { cohort: 1, district: 'Shimla', name: 'Govt. ITI Sunni',
    agency: 'The Planet Education Society', participants: 34,
    website: 'https://itisunni.edu.in/',
    contact: { name: 'Principal, ITI Sunni', phone: '+91 177-2790215', email: 'itisunni@rediffmail.com' },
    address: 'Sunni, Tehsil Sunni, Shimla, Himachal Pradesh 171301',
    about: 'Cohort-1 ITI from Shimla district trained under The Planet Education Society.' },

  { cohort: 2, district: 'Shimla', name: 'Govt College Nerva',
    agency: 'The Planet Education Society', participants: 39,
    website: 'https://gdcnerwa.edu.in/',
    contact: { name: 'Principal, GDC Nerva', phone: '+91 1783-244018', email: 'gdcnerva@gmail.com' },
    address: 'Nerva, Chopal, Shimla, Himachal Pradesh 171210',
    about: 'Government degree college in rural Shimla engaging students with EDP workshops.' },

  { cohort: 2, district: 'Shimla', name: 'Govt Degree College Saraswati Nagar',
    agency: 'The Planet Education Society', participants: 31,
    website: 'https://www.lbsgcsnagar.edu.in/',
    contact: { name: 'Principal, GDC Saraswati Nagar', phone: '+91 1781-244238', email: 'lbsgcsnagar@gmail.com' },
    address: 'Saraswati Nagar, Jubbal, Shimla, Himachal Pradesh 171207',
    about: 'Named after Lal Bahadur Shastri; participates in RAMP venture-creation modules.' },

  { cohort: 2, district: 'Shimla', name: 'Atal Bihari Vajpayee Govt. Institute of Engineering & Technology, Pragatinagar',
    agency: 'The Planet Education Society', participants: 102,
    website: 'https://abvgiet.ac.in/',
    contact: { name: 'Director, ABVGIET Pragatinagar', phone: '+91 1782-275016', email: 'director@abvgiet.ac.in' },
    address: 'Pragatinagar (Gumma), Shimla, Himachal Pradesh 172024',
    about: 'Engineering and technology institute supporting deep-tech ventures and faculty-led innovation.' },

  // ---------- SIRMAUR ----------
  { cohort: 1, district: 'Sirmaur', name: 'Govt. Degree College Shillai',
    agency: 'The Planet Education Society', participants: 38,
    website: 'https://gcshillai.in/',
    contact: { name: 'Principal, GDC Shillai', phone: '+91 1799-276028', email: 'gdcshillai@gmail.com' },
    address: 'Shillai, Sirmaur, Himachal Pradesh 173027',
    about: 'Cohort-1 college from Sirmaur district focused on rural enterprise creation.' },

  { cohort: 2, district: 'Sirmaur', name: 'Govt. Degree College Bharali (Anjhoj)',
    agency: 'The Planet Education Society', participants: 64,
    website: 'https://www.gdcb.ac.in/',
    contact: { name: 'Principal, GDC Bharali', phone: '+91 1702-238021', email: 'gdcbharali@gmail.com' },
    address: 'Bharali (Anjhoj), Sirmaur, Himachal Pradesh 173025',
    about: 'Multi-stream degree college contributing to RAMP venture pipeline in Sirmaur.' },

  { cohort: 2, district: 'Sirmaur', name: 'Govt. Degree College Kaffota',
    agency: 'The Planet Education Society', participants: 55,
    website: 'https://www.gckaffota.ac.in/',
    contact: { name: 'Principal, GDC Kaffota', phone: '+91 1702-272118', email: 'gdckaffota@gmail.com' },
    address: 'Kaffota, Sirmaur, Himachal Pradesh 173023',
    about: 'Supports digital marketing and business model canvas modules for rural students.' },

  { cohort: 2, district: 'Sirmaur', name: 'Govt. Degree College Sangrah',
    agency: 'The Planet Education Society', participants: 70,
    website: 'https://gcsangrah.in/',
    contact: { name: 'Principal, GDC Sangrah', phone: '+91 1799-258028', email: 'gdcsangrah@gmail.com' },
    address: 'Sangrah, Sirmaur, Himachal Pradesh 173023',
    about: 'Rural Sirmaur college developing micro-enterprise pipelines in agri and handicrafts.' },

  // ---------- KINNAUR ----------
  { cohort: 2, district: 'Kinnaur', name: 'Govt. Sr. Sec. School Urni',
    agency: 'The Planet Education Society', participants: 24,
    contact: { name: 'Principal, GSSS Urni', phone: '+91 1786-262247', email: 'gsssurni@gmail.com' },
    address: 'Urni, Kinnaur, Himachal Pradesh 172108',
    about: 'Senior secondary school sensitizing students to entrepreneurship in remote Kinnaur.' },

  { cohort: 2, district: 'Kinnaur', name: 'Govt. Sr. Sec. School Reckong Peo',
    agency: 'The Planet Education Society', participants: 41,
    website: 'https://pmshrigsssreckongpeo.com/',
    contact: { name: 'Principal, PM SHRI GSSS Reckong Peo', phone: '+91 1786-222232', email: 'gsssreckongpeo@gmail.com' },
    address: 'Reckong Peo, Kinnaur, Himachal Pradesh 172107',
    about: 'PM SHRI flagship school in district HQ engaging students with sensitization workshops.' },

  { cohort: 2, district: 'Kinnaur', name: 'Govt. Sr. Sec. School Giabong',
    agency: 'The Planet Education Society', participants: 21,
    contact: { name: 'Principal, GSSS Giabong', phone: '+91 1786-242201', email: 'gsssgiabong@gmail.com' },
    address: 'Giabong, Kinnaur, Himachal Pradesh 172116',
    about: 'High-altitude Kinnaur school participating in Phase II of RAMP.' },

  // ---------- SOLAN ----------
  { cohort: 1, district: 'Solan', name: 'ITI Arki',
    agency: 'Skill Labs', participants: 80,
    website: 'https://www.itiarki.edu.in/',
    contact: { name: 'Principal, ITI Arki', phone: '+91 1796-220028', email: 'itiarki@rediffmail.com' },
    address: 'Arki, Solan, Himachal Pradesh 173208',
    about: 'Cohort-1 ITI from Solan district operating under Skill Labs implementation.' },

  { cohort: 2, district: 'Solan', name: 'Govt. College Dharampur',
    agency: 'Skill Labs', participants: 46,
    website: 'https://www.gcdharampursolan.edu.in/',
    contact: { name: 'Principal, GC Dharampur', phone: '+91 1792-264028', email: 'gcdharampur@gmail.com' },
    address: 'Dharampur, Solan, Himachal Pradesh 173209',
    about: 'Government college in Dharampur supporting RAMP EDP modules.' },

  { cohort: 2, district: 'Solan', name: 'Govt. ITI Krishangarh',
    agency: 'Skill Labs', participants: 24,
    contact: { name: 'Principal, ITI Krishangarh', phone: '+91 1792-280125', email: 'itikrishangarh@rediffmail.com' },
    address: 'Krishangarh, Solan, Himachal Pradesh 173205',
    about: 'Smaller cohort focusing on close mentorship for craft and trade ventures.' },

  { cohort: 2, district: 'Solan', name: 'MSME Technology Centre, Baddi',
    agency: 'Skill Labs', participants: 28,
    website: 'https://msmetcbaddi.org/',
    contact: { name: 'Director, MSME-TC Baddi', phone: '+91 1795-244561', email: 'info@msmetcbaddi.org' },
    address: 'Baddi, Solan, Himachal Pradesh 173205',
    about: 'Tool room and technology centre supporting industrial entrepreneurship in Baddi cluster.' },

  // ---------- UNA ----------
  { cohort: 1, district: 'Una', name: 'ITI Bangana',
    agency: 'Skill Labs', participants: 30,
    website: 'https://govtitibangana.edu.in/',
    contact: { name: 'Principal, ITI Bangana', phone: '+91 1976-269028', email: 'itibangana@rediffmail.com' },
    address: 'Bangana, Una, Himachal Pradesh 174307',
    about: 'Cohort-1 ITI from Una district operating under Skill Labs implementation.' },

  { cohort: 2, district: 'Una', name: 'S D College, Bhatoli',
    agency: 'Skill Labs', participants: 38,
    website: 'https://svsdbhatoli.in/',
    contact: { name: 'Principal, SD College Bhatoli', phone: '+91 1975-225041', email: 'svsdbhatoli@gmail.com' },
    address: 'Bhatoli, Una, Himachal Pradesh 174303',
    about: 'Private college contributing to the Phase II venture pipeline.' },

  { cohort: 2, district: 'Una', name: 'Govt. College Khad',
    agency: 'Skill Labs', participants: 72,
    website: 'https://gdckhad.in/',
    contact: { name: 'Principal, GDC Khad', phone: '+91 1975-281232', email: 'gdckhad@gmail.com' },
    address: 'Khad, Una, Himachal Pradesh 177209',
    about: 'Government degree college engaging students with EDP modules.' },

  { cohort: 2, district: 'Una', name: 'BR Ambedkar Govt. Polytechnic, Ambota',
    agency: 'Skill Labs', participants: 38,
    website: 'https://www.gpambota.edu.in/',
    contact: { name: 'Principal, GP Ambota', phone: '+91 1976-242228', email: 'gpambota@gmail.com' },
    address: 'Ambota, Una, Himachal Pradesh 174303',
    about: 'Polytechnic institute supporting diploma-level entrepreneurship training.' },

  // ---------- HAMIRPUR ----------
  { cohort: 1, district: 'Hamirpur', name: 'Sidharth Govt College, Nadaun',
    agency: 'Skill Labs', participants: 50,
    website: 'https://gcnadaun.ac.in/',
    contact: { name: 'Principal, Sidharth GC Nadaun', phone: '+91 1972-232032', email: 'gcnadaun@gmail.com' },
    address: 'Nadaun, Hamirpur, Himachal Pradesh 177033',
    about: 'Cohort-1 college from Hamirpur with strong faculty engagement.' },

  { cohort: 2, district: 'Hamirpur', name: 'Govt. ITI Bhoranj',
    agency: 'Skill Labs', participants: 33,
    website: 'https://www.itibhoranj.edu.in/',
    contact: { name: 'Principal, ITI Bhoranj', phone: '+91 1972-266105', email: 'itibhoranj@rediffmail.com' },
    address: 'Bhoranj, Hamirpur, Himachal Pradesh 176045',
    about: 'ITI supporting trade-led venture creation in Hamirpur.' },

  { cohort: 2, district: 'Hamirpur', name: 'College of Horticulture & Forestry, Neri',
    agency: 'Skill Labs', participants: 39,
    website: 'https://www.yspuniversity.ac.in/user/cohfn/college_of_horticulture_and_forestry_neri',
    contact: { name: 'Dean, CoHF Neri', phone: '+91 1972-264062', email: 'deancohfneri@yspuniversity.ac.in' },
    address: 'Neri, Hamirpur, Himachal Pradesh 177001',
    about: 'Constituent of YSP University supporting agri- and horticulture-led startups.' },

  { cohort: 2, district: 'Hamirpur', name: 'Govt. College Barsar',
    agency: 'Skill Labs', participants: 32,
    website: 'https://gcbarsar.ac.in/',
    contact: { name: 'Principal, GC Barsar', phone: '+91 1972-285142', email: 'gcbarsar@gmail.com' },
    address: 'Barsar, Hamirpur, Himachal Pradesh 174305',
    about: 'Degree college supporting business model canvas modules for students.' },

  // ---------- BILASPUR ----------
  { cohort: 2, district: 'Bilaspur', name: 'Govt. ITI Berthin',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 115,
    website: 'https://www.itiberthin.edu.in/',
    contact: { name: 'Principal, ITI Berthin', phone: '+91 1978-242228', email: 'itiberthin@rediffmail.com' },
    address: 'Berthin, Bilaspur, Himachal Pradesh 174029',
    about: 'Large ITI with 115 participants engaged in RAMP Phase II.' },

  { cohort: 2, district: 'Bilaspur', name: 'Govt. ITI Shri Naina Devi Ji',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 80,
    website: 'https://www.itishrinainadeviji.edu.in/',
    contact: { name: 'Principal, ITI Shri Naina Devi Ji', phone: '+91 1978-273046', email: 'itinainadevi@rediffmail.com' },
    address: 'Shri Naina Devi Ji, Bilaspur, Himachal Pradesh 174310',
    about: 'ITI near pilgrim town engaging students with tourism-linked ventures.' },

  { cohort: 2, district: 'Bilaspur', name: 'Govt. College Jukhala',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 104,
    website: 'https://www.gcjukhala.ac.in/',
    contact: { name: 'Principal, GC Jukhala', phone: '+91 1978-260128', email: 'gcjukhala@gmail.com' },
    address: 'Jukhala, Bilaspur, Himachal Pradesh 174033',
    about: 'Government college contributing to the Phase II venture pipeline.' },

  { cohort: 2, district: 'Bilaspur', name: 'Govt. Hydro Engineering College, Bandla',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 62,
    website: 'https://ghec.ac.in/',
    contact: { name: 'Director, GHEC Bandla', phone: '+91 1978-225025', email: 'director@ghec.ac.in' },
    address: 'Bandla, Bilaspur, Himachal Pradesh 174001',
    about: 'Specialized engineering college focused on hydro-power and clean energy ventures.' },

  // ---------- CHAMBA ----------
  { cohort: 1, district: 'Chamba', name: 'Rajiv Gandhi Govt. Polytechnic College Banikhet',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 43,
    website: 'https://www.gpbanikhet.edu.in/',
    contact: { name: 'Principal, RGGPC Banikhet', phone: '+91 1899-236028', email: 'gpbanikhet@gmail.com' },
    address: 'Banikhet, Chamba, Himachal Pradesh 176303',
    about: 'Polytechnic supporting diploma students with venture-creation modules.' },

  { cohort: 1, district: 'Chamba', name: 'Batt Private ITI Bhonkharimorh',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 104,
    website: 'https://www.battiti.co.in/',
    contact: { name: 'Director, Batt Pvt ITI', phone: '+91 1899-245025', email: 'battiti@gmail.com' },
    address: 'Bhonkharimorh, P.O. Bathri, Tehsil Dalhousie, Chamba, HP 176314',
    about: 'Private ITI with 104 participants in cohort-1 RAMP rollout.' },

  { cohort: 2, district: 'Chamba', name: 'Govt. ITI Chamba',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 96,
    website: 'https://govtitichamba.edu.in/',
    contact: { name: 'Principal, ITI Chamba', phone: '+91 1899-222232', email: 'itichamba@rediffmail.com' },
    address: 'Chamba, Himachal Pradesh 176310',
    about: 'District-headquarters ITI engaging 96 participants in Phase II.' },

  { cohort: 2, district: 'Chamba', name: 'Govt. ITI Salooni',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 59,
    website: 'https://www.gitisalooni.edu.in/',
    contact: { name: 'Principal, ITI Salooni', phone: '+91 1896-262025', email: 'itisalooni@rediffmail.com' },
    address: 'Salooni, Chamba, Himachal Pradesh 176320',
    about: 'Remote ITI in Chamba district participating in venture-creation modules.' },

  { cohort: 2, district: 'Chamba', name: 'Govt. ITI Garnota',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 129,
    website: 'https://itigarnota.ac.in/',
    contact: { name: 'Principal, ITI Garnota', phone: '+91 1899-258125', email: 'itigarnota@rediffmail.com' },
    address: 'Garnota, Chamba, Himachal Pradesh 176315',
    about: 'ITI with 129 participants — among the largest cohorts in Chamba.' },

  // ---------- KANGRA ----------
  { cohort: 1, district: 'Kangra', name: 'Rajiv Gandhi Govt. Engg. College, Nagrota Bagwan',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 72,
    website: 'https://rggec.ac.in/',
    contact: { name: 'Director, RGGEC Nagrota Bagwan', phone: '+91 1892-252028', email: 'rggec@gmail.com' },
    address: 'Nagrota Bagwan, Kangra, Himachal Pradesh 176047',
    about: 'Engineering college supporting deep-tech and hardware ventures.' },

  { cohort: 1, district: 'Kangra', name: 'Govt. ITI Nehran Pukhar',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 70,
    website: 'https://www.itinpk.edu.in/',
    contact: { name: 'Principal, ITI Nehran Pukhar', phone: '+91 1892-260128', email: 'itinpk@rediffmail.com' },
    address: 'Nehran Pukhar, Kangra, Himachal Pradesh 176022',
    about: 'Cohort-1 ITI supporting venture-creation modules under RCED.' },

  { cohort: 2, district: 'Kangra', name: 'Govt. Industrial Training Institute (ITI) Shahpur',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 211,
    website: 'https://itishahpurhp.edu.in/',
    contact: { name: 'Principal, ITI Shahpur', phone: '+91 1892-238125', email: 'itishahpur@rediffmail.com' },
    address: 'Shahpur, Kangra, Himachal Pradesh 176206',
    about: 'Largest cohort in the network — 211 participants engaged in Phase II.' },

  { cohort: 2, district: 'Kangra', name: 'Wazir Ram Singh Government College, Dehri',
    agency: 'Regional Centre for Entrepreneurship Development', participants: 79,
    website: 'https://www.govtcollegedehri.org/',
    contact: { name: 'Principal, WRSGC Dehri', phone: '+91 1892-275028', email: 'gcdehri@gmail.com' },
    address: 'Dehri, Kangra, Himachal Pradesh 176022',
    about: 'Government college supporting EDP and BMC modules for rural students.' },
];

// Add slug & id to each entry
INSTITUTES.forEach((it, i) => {
  it.id = slug(it.name);
  it.idx = i;
});

const DISTRICTS = [...new Set(INSTITUTES.map(i => i.district))];

// State-level RAMP leadership
const MEMBERS = [
  { name: 'Dr. Puran Singh', role: 'Faculty Incharge — IIT Mandi Catalyst', org: 'IIT Mandi', email: 'puran@iitmandi.ac.in', phone: '+91 1905-267028' },
  { name: 'Director', role: 'Department of Industries', org: 'Government of Himachal Pradesh', email: 'dir-ind-hp@nic.in', phone: '+91 177-2813414' },
  { name: 'CEO', role: 'Himachal Pradesh Council for Entrepreneurship Development (HPCED)', org: 'HPCED', email: 'ceo@hpced.in', phone: '+91 177-2622233' },
  { name: 'Programme Manager', role: 'RAMP Project Management Unit', org: 'Government of Himachal Pradesh', email: 'pmu-ramp@hp.gov.in', phone: '+91 177-2620404' },
  { name: 'Coordinator', role: 'The Planet Education Society', org: 'Implementing Agency', email: 'contact@theplaneteducation.org', phone: '+91 98160 00000' },
  { name: 'Coordinator', role: 'Skill Labs', org: 'Implementing Agency', email: 'info@skill-labs.in', phone: '+91 98160 00000' },
  { name: 'Coordinator', role: 'Regional Centre for Entrepreneurship Development', org: 'Implementing Agency', email: 'contact@rced.in', phone: '+91 98160 00000' },
];

// News
const NEWS = [
  { date: '2026-04-12', title: 'Phase II Bootcamp at IIT Mandi — 60 students from 12 ITIs',
    body: 'Shortlisted participants visited the Drone, Robotics and Design Practicum labs at IIT Mandi to refine prototypes and meet founders.' },
  { date: '2026-03-02', title: 'Hybrid mentoring extended for Lahaul & Spiti winter cohorts',
    body: 'The Winter Incubation Protocol enables virtual sessions when road closures block physical access to high-altitude centres.' },
  { date: '2026-01-15', title: 'Pankaj Singh (Pahadhan) and Sachin Korla (Udyamwell) join mentor pool',
    body: 'Founders share practical insights into village economies during the IIT Mandi exposure visit.' },
  { date: '2025-11-20', title: 'Sensitization workshops reach 1,000+ students in Phase I',
    body: 'Mandi, Kullu and Lahaul & Spiti complete the first wave of sensitization covering 30+ faculty members.' },
  { date: '2025-10-04', title: 'RAMP onboards three new implementing agencies',
    body: 'The Planet Education Society, Skill Labs and the Regional Centre for Entrepreneurship Development join the state-wide rollout.' },
];

window.RAMP_DATA = { INSTITUTES, DISTRICTS, MEMBERS, NEWS, slug };

})();
