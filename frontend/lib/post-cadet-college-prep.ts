export interface Resource {
    title: string
    url: string
}

export interface PrepCard {
    id: string
    type: string
    color: string
    title: string
    description: string
    tips: string[]
    resources: Resource[]
}

export const POST_CADET_DATA: PrepCard[] = [
    {
        id: "issb",
        type: "ISSB Preparation",
        color: "indigo",
        title: "ISSB Preparation Guide",
        description:
            "Inter Services Selection Board (ISSB) tests candidates for officer positions in Bangladesh Armed Forces including Army, Navy, and Air Force. The 4-day residential selection process evaluates intelligence, personality, leadership qualities, and physical fitness through various tests and interviews.",
        tips: [
            "Practice group discussions and take leadership roles in team activities daily",
            "Improve physical fitness — focus on running 1.5 miles, push-ups, pull-ups, and obstacle courses",
            "Read national and international newspapers daily for current affairs and general knowledge",
            "Practice psychological tests — word association, incomplete sentences, story writing (TAT/WAT/SRT)",
            "Work on communication skills and confidence in both English and Bengali",
            "Study basic science, mathematics, and Bangladesh history thoroughly",
            "Practice outdoor tasks — command tasks, group obstacles, individual obstacles",
            "Improve your body language, eye contact, and overall presentation",
            "Sleep well and maintain a healthy routine during the ISSB days",
            "Be honest and consistent throughout all tests and interviews",
        ],
        resources: [
            { title: "ISSB Official Website", url: "https://issb.gov.bd" },
            { title: "Bangladesh Army Recruitment", url: "https://www.army.mil.bd" },
            { title: "Bangladesh Navy Recruitment", url: "https://www.navy.mil.bd" },
            { title: "Bangladesh Air Force", url: "https://www.baf.mil.bd" },
            { title: "ISSB Preparation Guide", url: "https://bdmilitary.com/issb" },
        ],
    },

    {
        id: "engineering",
        type: "Engineering University Admission",
        color: "blue",
        title: "Engineering University Admission Guide",
        description:
            "Admission to top engineering universities in Bangladesh including BUET, CUET, RUET, KUET, and DUET. These institutions offer world-class engineering education. The admission test requires a strong foundation in Physics, Chemistry, and Higher Mathematics. Competition is extremely high with thousands of students competing for limited seats.",
        tips: [
            "Master HSC Physics thoroughly — mechanics, waves, thermodynamics, electricity, modern physics",
            "Practice Higher Mathematics daily — calculus, algebra, coordinate geometry, trigonometry, vectors",
            "Solve previous 10 years BUET admission question papers repeatedly",
            "Focus on Chemistry — organic reactions, inorganic chemistry, physical chemistry calculations",
            "Time management is crucial — practice solving 1 question per minute on average",
            "Join a reputable coaching center or study group for guided preparation",
            "Maintain minimum GPA requirements in both SSC and HSC",
            "Focus on unit conversions, formula derivations, and numerical problem solving",
            "Practice multiple choice questions under timed conditions regularly",
            "Review NCTE and HSC board books thoroughly before attempting advanced problems",
        ],
        resources: [
            { title: "BUET Admission Info", url: "https://buet.ac.bd/admission" },
            { title: "CUET Admission", url: "https://cuet.ac.bd" },
            { title: "RUET Admission", url: "https://ruet.ac.bd" },
            { title: "KUET Admission", url: "https://kuet.ac.bd" },
            { title: "DUET Admission", url: "https://duet.ac.bd" },
            { title: "Engineering Admission Tips", url: "https://admission.ac.bd" },
        ],
    },

    {
        id: "university",
        type: "University Admission",
        color: "emerald",
        title: "General University Admission Guide",
        description:
            "General university admission in Bangladesh covers Dhaka University, Rajshahi University, Jahangirnagar University, Chittagong University, and many other public and private universities. GST cluster admission system is used by many universities. Tests cover all HSC subjects including Bangla, English, Science, and General Knowledge depending on the unit.",
        tips: [
            "Cover all HSC subjects thoroughly based on your desired unit (A, B, C, D)",
            "Practice Bangla grammar, literature, and composition questions extensively",
            "Improve English — vocabulary building, grammar rules, comprehension passages",
            "Focus heavily on General Knowledge — Bangladesh affairs, world events, science facts",
            "Solve past 5 years admission question papers for each university",
            "Manage time carefully — do not spend too much time on any single question",
            "For Dhaka University — focus on unit-specific syllabus and previous question patterns",
            "Practice mental ability and IQ questions for aptitude-based units",
            "Maintain good results in both SSC and HSC as they carry marks in admission",
            "Stay updated with current affairs, science discoveries, and national events",
        ],
        resources: [
            { title: "Dhaka University", url: "https://du.ac.bd" },
            { title: "Rajshahi University", url: "https://ru.ac.bd" },
            { title: "Jahangirnagar University", url: "https://juniv.edu" },
            { title: "Chittagong University", url: "https://cu.ac.bd" },
            { title: "GST Cluster Admission", url: "https://gstadmission.ac.bd" },
            { title: "Admission Circular 2024", url: "https://admission.ac.bd" },
        ],
    },

    {
        id: "medical",
        type: "Medical Preparation",
        color: "rose",
        title: "Medical University Admission Guide",
        description:
            "Medical admission in Bangladesh for MBBS and BDS programs at government and private medical colleges is conducted by DGHS (Directorate General of Health Services). The unified admission test covers Biology, Chemistry, Physics, English, and General Knowledge. Government medical colleges are extremely competitive with limited seats. Cadet College students have an advantage due to their disciplined academic background.",
        tips: [
            "Biology is the most important subject — cover HSC Biology chapters thoroughly and in detail",
            "Chemistry focus — especially organic chemistry reactions, equations, and calculations",
            "Physics — optics, electricity, modern physics, and thermodynamics are frequently tested",
            "English vocabulary and grammar are tested — build vocabulary daily with flashcards",
            "Practice MCQ format extensively — negative marking of 0.25 applies for wrong answers",
            "Minimum GPA of 9.00 combined in SSC and HSC is required for government colleges",
            "Study cell biology, genetics, human physiology, and plant biology in depth",
            "Solve previous 10 years MBBS admission question papers repeatedly",
            "Focus on diagram-based questions in Biology — practice drawing and labeling",
            "Stay updated with medical news and health-related general knowledge",
        ],
        resources: [
            { title: "DGHS Medical Admission", url: "https://dghs.gov.bd" },
            { title: "Medical Admission Portal", url: "https://medicaladmission.ged.gov.bd" },
            { title: "Dhaka Medical College", url: "https://dmc.gov.bd" },
            { title: "Armed Forces Medical College", url: "https://afmc.mil.bd" },
            { title: "Medical Preparation Guide", url: "https://admission.ac.bd/medical" },
        ],
    },
]