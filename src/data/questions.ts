export type QuestionType = 'multiple-choice' | 'essay';

export type Question = {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
};

export type SubjectData = Record<string, Question[]>;
export type GradeData = Record<string, SubjectData>;

// --- REAL COMPREHENSIVE DATA ---

const rawData: GradeData = {
  grade1: {
    matematika: [
      { id: "g1m1", type: 'multiple-choice', question: "Setelah angka 15 adalah angka...", options: ["14", "16", "17", "18"], answer: "16" },
      { id: "g1m2", type: 'multiple-choice', question: "7 + 5 = ...", options: ["11", "12", "13", "14"], answer: "12" },
      { id: "g1m3", type: 'multiple-choice', question: "Lambang bilangan 'dua puluh' adalah...", options: ["12", "2", "20", "22"], answer: "20" },
      { id: "g1e1", type: 'essay', question: "Berapa hasil dari 10 dikurangi 3?", answer: "7" }
    ],
    indonesia: [
      { id: "g1i1", type: 'multiple-choice', question: "Huruf vokal pada kata 'BUKU' adalah...", options: ["B dan K", "U dan U", "B dan U", "K dan U"], answer: "U dan U" },
      { id: "g1i2", type: 'multiple-choice', question: "Ibu memasak di...", options: ["Kamar", "Halaman", "Dapur", "Ruang tamu"], answer: "Dapur" },
      { id: "g1e1", type: 'essay', question: "Lanjutkan kalimat ini: Mata digunakan untuk...", answer: "Melihat" }
    ],
    ppkn: [
      { id: "g1p1", type: 'multiple-choice', question: "Lambang negara Indonesia adalah...", options: ["Pohon Beringin", "Garuda Pancasila", "Bendera", "Rantai"], answer: "Garuda Pancasila" },
      { id: "g1p2", type: 'multiple-choice', question: "Warna bendera Indonesia adalah...", options: ["Merah Biru", "Putih Merah", "Merah Putih", "Hijau Kuning"], answer: "Merah Putih" }
    ]
  },
  grade2: {
    matematika: [
      { id: "g2m1", type: 'multiple-choice', question: "Bentuk perkalian dari 3 + 3 + 3 + 3 adalah...", options: ["3 x 3", "4 x 3", "3 x 4", "4 x 4"], answer: "4 x 3" },
      { id: "g2m2", type: 'multiple-choice', question: "250 ... 205 (Tanda yang tepat adalah)", options: [">", "<", "=", "≠"], answer: ">" },
      { id: "g2e1", type: 'essay', question: "Berapa hasil dari 5 dikali 4?", answer: "20" }
    ],
    indonesia: [
      { id: "g2i1", type: 'multiple-choice', question: "Persamaan kata 'Giat' adalah...", options: ["Malas", "Rajin", "Pintar", "Bosan"], answer: "Rajin" },
      { id: "g2i2", type: 'multiple-choice', question: "Tanda untuk mengakhiri kalimat berita adalah...", options: ["Tanda tanya", "Tanda seru", "Titik", "Koma"], answer: "Titik" }
    ],
    ipas: [
      { id: "g2s1", type: 'multiple-choice', question: "Bagian tubuh burung yang digunakan untuk terbang adalah...", options: ["Ekor", "Sayap", "Paruh", "Cakar"], answer: "Sayap" },
      { id: "g2s2", type: 'multiple-choice', question: "Benda yang bentuknya berubah mengikuti tempatnya adalah...", options: ["Batu", "Kayu", "Air", "Besi"], answer: "Air" }
    ]
  },
  grade3: {
    matematika: [
      { id: "g3m1", type: 'multiple-choice', question: "Hasil dari 12 x 5 adalah...", options: ["50", "55", "60", "65"], answer: "60" },
      { id: "g3m2", type: 'multiple-choice', question: "Bilangan 3.450 dibaca...", options: ["Tiga ratus empat puluh lima", "Tiga ribu empat ratus lima puluh", "Tiga ribu empat puluh lima", "Tiga ratus lima puluh"], answer: "Tiga ribu empat ratus lima puluh" },
      { id: "g3m3", type: 'multiple-choice', question: "Sudut yang besarnya 90 derajat disebut...", options: ["Sudut lancip", "Sudut tumpul", "Sudut siku-siku", "Sudut lurus"], answer: "Sudut siku-siku" },
      { id: "g3e1", type: 'essay', question: "Berapa hasil dari 100 dibagi 4?", answer: "25" }
    ],
    indonesia: [
      { id: "g3i1", type: 'multiple-choice', question: "Lawan kata dari 'Haus' adalah...", options: ["Lapar", "Kenyang", "Puas", "Segar"], answer: "Puas" },
      { id: "g3i2", type: 'multiple-choice', question: "Tanda baca yang digunakan untuk bertanya adalah...", options: ["!", "?", ".", ","], answer: "?" },
      { id: "g3e1", type: 'essay', question: "Apa sebutan untuk buku yang berisi kumpulan peta?", answer: "Atlas" }
    ],
    ipas: [
      { id: "g3s1", type: 'multiple-choice', question: "Makhluk hidup yang dapat membuat makanan sendiri adalah...", options: ["Hewan", "Manusia", "Tumbuhan", "Jamur"], answer: "Tumbuhan" },
      { id: "g3s2", type: 'multiple-choice', question: "Benda gas memiliki sifat...", options: ["Bentuk tetap", "Menempati ruang", "Terlihat jelas", "Sulit bergerak"], answer: "Menempati ruang" },
      { id: "g3e1", type: 'essay', question: "Sebutkan 3 kebutuhan utama makhluk hidup!", answer: "Udara, air, makanan" }
    ],
    ppkn: [
      { id: "g3p1", type: 'multiple-choice', question: "Sila kedua Pancasila dilambangkan dengan...", options: ["Bintang", "Rantai", "Pohon Beringin", "Padi dan Kapas"], answer: "Rantai" },
      { id: "g3p2", type: 'multiple-choice', question: "Semboyan Bangsa Indonesia adalah...", options: ["Maju Gentar", "Bhinneka Tunggal Ika", "Tut Wuri Handayani", "Merdeka atau Mati"], answer: "Bhinneka Tunggal Ika" }
    ]
  },
  grade4: {
    matematika: [
      { id: "g4m1", type: 'multiple-choice', question: "KPK dari 4 dan 6 adalah...", options: ["12", "24", "10", "8"], answer: "12" },
      { id: "g4m2", type: 'multiple-choice', question: "Luas persegi dengan sisi 10 cm adalah...", options: ["20 cm²", "40 cm²", "100 cm²", "200 cm²"], answer: "100 cm²" },
      { id: "g4e1", type: 'essay', question: "Berapa hasil dari 1.500 + 2.750?", answer: "4250" }
    ],
    ipas: [
      { id: "g4s1", type: 'multiple-choice', question: "Proses pembuatan makanan pada tumbuhan disebut...", options: ["Oksidasi", "Fotosintesis", "Respirasi", "Penguapan"], answer: "Fotosintesis" },
      { id: "g4s2", type: 'multiple-choice', question: "Gaya yang terjadi saat kita mengerem sepeda adalah...", options: ["Gaya pegas", "Gaya otot", "Gaya gesek", "Gaya magnet"], answer: "Gaya gesek" },
      { id: "g4e1", type: 'essay', question: "Sebutkan perubahan wujud benda dari cair ke gas!", answer: "Menguap" }
    ]
  },
  grade5: {
    matematika: [
      { id: "g5m1", type: 'multiple-choice', question: "Hasil dari 1/2 + 1/4 adalah...", options: ["2/6", "3/4", "1/4", "3/6"], answer: "3/4" },
      { id: "g5m2", type: 'multiple-choice', question: "Kubus memiliki rusuk sebanyak...", options: ["6", "8", "10", "12"], answer: "12" }
    ],
    ipas: [
      { id: "g5s1", type: 'multiple-choice', question: "Alat pernapasan pada ikan adalah...", options: ["Paru-paru", "Trakea", "Insang", "Kulit"], answer: "Insang" },
      { id: "g5s2", type: 'multiple-choice', question: "Planet terbesar dalam tata surya kita adalah...", options: ["Saturnus", "Jupiter", "Bumi", "Neptunus"], answer: "Jupiter" }
    ]
  },
  grade6: {
    matematika: [
      { id: "g6m1", type: 'multiple-choice', question: "Akar pangkat tiga dari 1.000 adalah...", options: ["10", "100", "5", "20"], answer: "10" },
      { id: "g6m2", type: 'multiple-choice', question: "Hasil dari -10 + 15 - 5 adalah...", options: ["10", "5", "0", "-10"], answer: "0" }
    ],
    ipas: [
      { id: "g6s1", type: 'multiple-choice', question: "Bapak Proklamator Indonesia adalah...", options: ["Soeharto", "Ir. Soekarno", "Moh. Hatta", "Soekarno dan Moh. Hatta"], answer: "Soekarno dan Moh. Hatta" },
      { id: "g6e1", type: 'essay', question: "Apa nama peristiwa bumi berputar pada porosnya?", answer: "Rotasi" }
    ]
  }
};

// Objek untuk menampung subjek yang tidak didefinisikan agar tidak error
const fallbackData: Record<string, Question[]> = {
  matematika: [{ id: "fb1", type: "multiple-choice", question: "1 + 1 = ...", options: ["1", "2", "3", "4"], answer: "2" }],
  indonesia: [{ id: "fb2", type: "multiple-choice", question: "Ibukota Indonesia adalah...", options: ["Bandung", "Surabaya", "Jakarta", "Medan"], answer: "Jakarta" }],
  ipas: [{ id: "fb3", type: "multiple-choice", question: "Energi panas terbesar bagi bumi adalah...", options: ["Bulan", "Bintang", "Matahari", "Lampu"], answer: "Matahari" }],
  ppkn: [{ id: "fb4", type: "multiple-choice", question: "Dasar negara kita adalah...", options: ["UUD 1945", "Pancasila", "Proklamasi", "Sumpah Pemuda"], answer: "Pancasila" }],
  blp: [{ id: "fb5", type: "multiple-choice", question: "Siger adalah simbol daerah...", options: ["Lampung", "Jawa", "Bali", "Papua"], answer: "Lampung" }],
  english: [{ id: "fb6", type: "multiple-choice", question: "English of 'Buku' is...", options: ["Pen", "Pencil", "Book", "Bag"], answer: "Book" }]
};

export const quizData: GradeData = {} as GradeData;

['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'].forEach(grade => {
  quizData[grade] = {};
  ['matematika', 'indonesia', 'ppkn', 'ipas', 'blp', 'english'].forEach(subject => {
    // Gunakan data asli jika ada, kalau tidak ada pakai fallback yang valid (bukan template ngaco)
    quizData[grade][subject] = rawData[grade]?.[subject] || fallbackData[subject] || fallbackData.matematika;
  });
});
