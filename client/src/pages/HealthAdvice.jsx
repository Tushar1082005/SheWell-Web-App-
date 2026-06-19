import { useState } from "react"
import { Link, useParams} from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

// Import all images
import aging from '../assets/General/aging.jpg'
import exercise from '../assets/General/exercise.jpg'
import mentalHealth from '../assets/General/mental_health.jpg'
import nutrition from '../assets/General/nutrition.jpg'
import sleepstress from '../assets/General/sleep&stress.png'
import preventive_health from '../assets/General/preventive_health.jpg'
import body_positivity from '../assets/body_positivity.jpg'
import contraception from '../assets/contraception.jpg'
import manage_period_pain from '../assets/manage_period_pain.jpg'
import fertility_awareness from '../assets/fertility_awareness.jpeg'
import pregnancy_planning from '../assets/pregnancy_planning.jpeg'
import pcos from '../assets/pcos.png'
import endrometrium_awareness from '../assets/endometrium_awareness.jpeg'
import meopause_transition from '../assets/meopause_transition.jpg'
import self_care from '../assets/self_care.png'
import mindfulness from '../assets/mindfulness.jpeg'
import women_fitness from "../assets/women_fitness.jpg"
import sexual_health from "../assets/sexual_health.jpeg"
import sanitary_pad from "../assets/sanitaryPad.png"
import PMS from "../assets/PMS.webp"
import cycle from "../assets/cycle.jpeg"

const healthArticles = {
  general: [
    {
      title: "Nutrition for Women's Health",
      description: "Essential nutrients and dietary recommendations for women at different life stages.",
      image: nutrition,
      content: `A balanced diet is crucial for women's health at every age. Key nutrients include:
      - Calcium and Vitamin D for bone health
      - Iron to prevent anemia
      - Folate for reproductive health
      - Omega-3 fatty acids for heart health
      
      Recommended daily intake varies by age and life stage. Consult a nutritionist for personalized advice.`
    },
    {
      title: "Exercise Guidelines",
      description: "Recommended physical activities and exercise routines for women's health.",
      image: exercise,
      content: `Regular exercise helps maintain:
      - Cardiovascular health
      - Muscle strength
      - Bone density
      - Mental wellbeing
      
      Aim for at least 150 minutes of moderate aerobic activity weekly, plus strength training twice a week. Adjust intensity during menstrual cycles.`
    },
    {
      title: "Sleep and Stress Management",
      description: "Tips for improving sleep quality and managing stress for better health.",
      image: sleepstress,
      content: `Quality sleep is essential for hormonal balance and cognitive function. Practice:
      - Consistent sleep schedule
      - Relaxation techniques before bed
      - Stress-reduction methods like meditation
      - Limiting screen time before sleep
      
      Chronic stress can disrupt menstrual cycles and affect overall health.`
    },
    {
      title: "Preventive Health Screenings",
      description: "Recommended health screenings and check-ups for women by age.",
      image: preventive_health,
      content: `Essential screenings include:
      20s-30s: Pap smears, STI tests, breast exams
      40s-50s: Mammograms, bone density scans, colon cancer screening
      60+: Regular cancer screenings, heart health checks
      
      Always consult your doctor for personalized recommendations.`
    },
    {
      title: "Mental Health Resources",
      description: "Support resources and strategies for maintaining good mental health.",
      image: mentalHealth,
      content: `Women are more prone to anxiety and depression. Important resources:
      - Therapy and counseling services
      - Support groups
      - Mindfulness apps
      - Crisis hotlines
      
      Prioritize self-care and seek help when needed.`
    },
    {
      title: "Healthy Aging",
      description: "Tips for maintaining health and wellness as you age.",
      image: aging,
      content: `Key aspects of healthy aging:
      - Regular health checkups
      - Maintaining social connections
      - Cognitive exercises
      - Adapting exercise routines
      - Hormone management
      
      Focus on prevention and early detection of age-related conditions.`
    }
  ],
  menstrual: [
    {
      title: "Understanding Your Cycle",
      description: "Learn about the phases of the menstrual cycle and what happens in your body.",
      image: cycle,
      content: `The menstrual cycle has four phases:
      1. Menstrual Phase (Days 1-5)
      2. Follicular Phase (Days 6-14)
      3. Ovulation (Day 14)
      4. Luteal Phase (Days 15-28)
      
      Tracking your cycle helps identify hormonal patterns and potential issues. Use apps or journals for better awareness.`
    },
    {
      title: "Managing Period Pain",
      description: "Effective strategies for dealing with menstrual cramps and discomfort.",
      image: manage_period_pain,
      content: `Natural remedies for menstrual cramps:
      - Heat therapy
      - Gentle yoga
      - Anti-inflammatory diet
      - Magnesium supplements
      
      Medical options:
      - NSAIDs
      - Hormonal birth control
      - Prescription medications
      
      Consult doctor if pain interferes with daily life.`
    },
    {
      title: "Menstrual Products Guide",
      description: "Comparing different menstrual products to find what works best for you.",
      image: sanitary_pad,
      content: `Options include:
      - Pads (disposable/reusable)
      - Tampons
      - Menstrual cups
      - Period underwear
      - Organic options
      
      Consider flow intensity, lifestyle, and environmental impact when choosing.`
    },
    {
      title: "Irregular Periods",
      description: "Causes of irregular periods and when to consult a healthcare provider.",
      image: pcos,
      content: `Common causes:
      - Hormonal imbalances
      - PCOS
      - Thyroid issues
      - Extreme weight changes
      - Stress
      
      Seek medical advice if:
      - Cycles shorter than 21 days
      - Cycles longer than 35 days
      - No period for 3+ months`
    },
    {
      title: "PMS and PMDD",
      description: "Understanding and managing premenstrual syndrome and premenstrual dysphoric disorder.",
      image: PMS,
      content: `PMS Management:
      - Regular exercise
      - Balanced diet
      - Stress reduction
      - Calcium supplements
      
      PMDD Treatment:
      - SSRIs
      - Cognitive behavioral therapy
      - Hormonal treatments
      
      Track symptoms for accurate diagnosis.`
    },
    {
      title: "Period Tracking Benefits",
      description: "How tracking your period can provide insights into your overall health.",
      image: cycle,
      content: `Benefits include:
      - Identifying cycle irregularities
      - Predicting ovulation
      - Managing PMS symptoms
      - Monitoring hormonal health
      - Detecting early pregnancy
      
      Use apps or journals for consistent tracking.`
    }
  ],
  reproductive: [
    {
      title: "Fertility Awareness",
      description: "Understanding your fertile window and tracking ovulation.",
      image: fertility_awareness,
      content: `Fertility awareness methods:
      - Basal body temperature tracking
      - Cervical mucus monitoring
      - Calendar method
      - LH surge detection
      
      Can be used for both conception and natural birth control. Requires consistent tracking.`
    },
    {
      title: "Contraception Options",
      description: "Overview of different birth control methods and their effectiveness.",
      image: contraception,
      content: `Options include:
      - Hormonal (pill, patch, ring)
      - LARC (IUD, implant)
      - Barrier methods
      - Natural family planning
      - Emergency contraception
      
      Effectiveness ranges from 76-99%. Consult doctor for best option.`
    },
    {
      title: "Pregnancy Planning",
      description: "Preparing your body for a healthy pregnancy and conception tips.",
      image: pregnancy_planning,
      content: `Preconception checklist:
      - Prenatal vitamins
      - Health screenings
      - Lifestyle adjustments
      - Genetic counseling
      - Tracking ovulation
      
      Allow 3-6 months for preparation.`
    },
    {
      title: "PCOS Management",
      description: "Understanding and managing Polycystic Ovary Syndrome.",
      image: pcos,
      content: `Management strategies:
      - Weight management
      - Insulin sensitivity diet
      - Regular exercise
      - Metformin therapy
      - Fertility treatments
      
      Focus on symptom management and preventing complications.`
    },
    {
      title: "Endometriosis Awareness",
      description: "Symptoms, diagnosis, and treatment options for endometriosis.",
      image: endrometrium_awareness,
      content: `Common symptoms:
      - Severe pelvic pain
      - Painful periods
      - Pain during sex
      - Infertility
      
      Treatment options:
      - Pain management
      - Hormonal therapies
      - Laparoscopic surgery
      - Alternative therapies`
    },
    {
      title: "Menopause Transition",
      description: "What to expect during perimenopause and menopause.",
      image: meopause_transition,
      content: `Common symptoms:
      - Hot flashes
      - Sleep disturbances
      - Mood changes
      - Vaginal dryness
      
      Management options:
      - HRT
      - Lifestyle modifications
      - Alternative therapies
      - Bone health monitoring
      
      Average onset age: 45-55`
    }
  ],
  wellness: [
    {
      title: "Self-Care Practices",
      description: "Essential self-care routines for physical and mental wellbeing.",
      image: self_care,
      content: `Self-care ideas:
      - Regular relaxation time
      - Hobbies and creative outlets
      - Digital detoxes
      - Spa treatments at home
      - Social connection
      
      Prioritize self-care without guilt.`
    },
    {
      title: "Hormonal Balance",
      description: "Natural ways to support hormonal balance throughout your cycle.",
      image: endrometrium_awareness,
      content: `Natural balancing methods:
      - Adaptogen herbs
      - Stress management
      - Healthy fats intake
      - Regular exercise
      - Toxin reduction
      
      Address root causes through functional medicine.`
    },
    {
      title: "Mindfulness for Women",
      description: "Mindfulness techniques specifically beneficial for women's health issues.",
      image: mindfulness,
      content: `Effective practices:
      - Menstrual cycle meditation
      - Body scan techniques
      - Hormonal awareness journaling
      - Yoga for different cycle phases
      
      Reduces PMS symptoms and improves cycle awareness.`
    },
    {
      title: "Women's Fitness",
      description: "Exercise approaches that complement women's hormonal cycles.",
      image: women_fitness,
      content: `Cycle-syncing workout plan:
      - Follicular phase: Cardio and strength
      - Ovulation: High-intensity training
      - Luteal phase: Moderate exercise
      - Menstrual phase: Gentle movement
      
      Adjust intensity based on energy levels.`
    },
    {
      title: "Sexual Health",
      description: "Important information about sexual health, pleasure, and communication.",
      image: sexual_health,
      content: `Key aspects:
      - Regular STI screenings
      - Consent and boundaries
      - Lubrication options
      - Pelvic floor health
      - Sexual dysfunction awareness
      
      Maintain open communication with partners.`
    },
    {
      title: "Body Positivity",
      description: "Embracing body positivity and developing a healthy relationship with your body.",
      image: body_positivity,
      content: `Practice:
      - Positive affirmations
      - Media literacy
      - Intuitive eating
      - Functional fitness
      - Social media detox
      
      Celebrate your body's capabilities over appearance.`
    }
  ]
}

export function HealthAdvice() {
  const [activeCategory, setActiveCategory] = useState("general")

  return (
    <div className="flex min-h-screen flex-col items-center">
      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/">
              <Button variant="outline" size="icon" asChild>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Health Advice</h1>
          </div>

          <Tabs defaultValue="general" onValueChange={setActiveCategory}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="menstrual">Menstrual</TabsTrigger>
              <TabsTrigger value="reproductive">Reproductive</TabsTrigger>
              <TabsTrigger value="wellness">Wellness</TabsTrigger>
            </TabsList>

            {Object.entries(healthArticles).map(([category, articles]) => (
              <TabsContent key={category} value={category}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article, index) => (
                    <Card key={index}>
                      <CardHeader className="p-0">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <CardDescription className="mt-2">{article.description}</CardDescription>
                        <Link to={`/health-advice/${category}/${index}`}>
                          <Button variant="link" className="p-0 h-auto mt-2">
                            Read more
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Health Recommendations</CardTitle>
                <CardDescription>Based on your period tracking data and health profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Connect your period tracking data to receive personalized health recommendations. Our AI-powered
                    system analyzes your cycle patterns, symptoms, and health profile to provide tailored advice for
                    your specific needs.
                  </p>
                  <Button>Connect Period Tracker</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export  function ArticleDetail() {
  const { category, id } = useParams()
  const articleId = parseInt(id ?? '0', 10)
  const categoryArticles = healthArticles[category]
  const article = categoryArticles?.[articleId]

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Link to="/health-advice">
            <Button>Back to Health Advice</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center">
      <main className="flex-1 py-8 w-full max-w-4xl">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/health-advice">
              <Button variant="outline" size="icon" asChild>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{article.title}</h1>
          </div>

          <Card>
            <CardHeader className="p-0">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 dark:text-gray-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}