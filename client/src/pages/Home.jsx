import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, Heart, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { useRef } from "react";
import { useSelector } from "react-redux";
import logo from "../assets/logo.png";
import { ArrowRight, Users, Brain, Lock } from "lucide-react";
import sanitaryPad from "../assets/sanitaryPad.png";
import ImpactSection from "../components/ImpactSection";
import women1 from "../assets/women1.png";
import women2 from "../assets/women2.png";
import women3 from "../assets/women3.png";
import drop from "../assets/drop.webp";
import { useLanguage } from "../LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const isloggedin = useSelector((state) => state.login.isAuth);
  const { t } = useLanguage();

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    // Hero section animation
    const heroElements = heroRef.current?.children;
    if (heroElements) {
      gsap.fromTo(
        heroElements,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.3,
          ease: "power3.out",
        }
      );
    }

    // Features section scroll animation
    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Cards animation
    const cardElements = cardsRef.current?.children;
    if (cardElements) {
      gsap.fromTo(
        cardElements,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-r from-pink-200 to-white dark:from-pink-950 dark:to-background">
      <main className="flex-1 w-full">
        <section className="w-full py-12 md:py-24 lg:py-32 items-center flex justify-center bg-gradient-to-r from-pink-200 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div
                className="flex flex-col justify-center space-y-4"
                ref={heroRef}
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    {t("heroTitle")}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t("heroDescription")}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    asChild
                    className="bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <Link to={isloggedin ? "/period-tracker" : "/login"}>
                      {t("getStarted")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary text-primary hover:bg-gray-100/40"
                    size="lg"
                  >
                    <Link to="/chatbot">{t("chatWithAI")}</Link>
                  </Button>
                </div>
              </div>
              <img
                src={logo}
                alt="SheWell Women's Health Platform"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                width={550}
                height={310}
              />
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white items-center flex justify-center">
          <div className="container px-4 md:px-6">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              ref={featuresRef}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm text-pink-700">
                  {t("keyFeatures")}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-pink-700">
                  {t("comprehensiveSolutions")}
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("solutionsDescription")}
                </p>
              </div>
            </div>
            <div
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12"
              ref={cardsRef}
            >
              <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Calendar className="h-10 w-10 text-pink-600" />
                  <CardTitle className="text-pink-700">
                    {t("menstrualHealth")}
                  </CardTitle>
                  <CardDescription>{t("menstrualDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-gray-500">
                    <li>{t("aiPeriodTracker")}</li>
                    <li>{t("pcosSupport")}</li>
                    <li>{t("padLocator")}</li>
                    <li>{t("birthControl")}</li>
                  </ul>
                  <Button variant="link" className="mt-4 p-0 text-pink-600">
                    {t("learnMore")} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Heart className="h-10 w-10 text-pink-600" />
                  <CardTitle className="text-pink-700">
                    {t("pregnancyCare")}
                  </CardTitle>
                  <CardDescription>{t("pregnancyDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-gray-500">
                    <li>{t("aiPregnancyRisk")}</li>
                    <li>{t("fetalMonitoring")}</li>
                    <li>{t("postpartumWellness")}</li>
                    <li>{t("breastfeedingSupport")}</li>
                  </ul>
                  <Button variant="link" className="mt-4 p-0 text-pink-600">
                    {t("learnMore")} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Brain className="h-10 w-10 text-pink-600" />
                  <CardTitle className="text-pink-700">
                    {t("mentalHealth")}
                  </CardTitle>
                  <CardDescription>{t("mentalDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-gray-500">
                    <li>{t("aiChatbot")}</li>
                    <li>{t("guidedMeditation")}</li>
                    <li>{t("sleepTracking")}</li>
                    <li>{t("anonymousForums")}</li>
                  </ul>
                  <Button variant="link" className="mt-4 p-0 text-pink-600">
                    {t("learnMore")} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Shield className="h-10 w-10 text-pink-600" />
                  <CardTitle className="text-pink-700">
                    {t("safetyAssistance")}
                  </CardTitle>
                  <CardDescription>{t("safetyDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-gray-500">
                    <li>{t("sosAlerts")}</li>
                    <li>{t("freeSanitaryProducts")}</li>
                    <li>{t("secureConsultations")}</li>
                    <li>{t("emergencyLocator")}</li>
                  </ul>
                  <Button variant="link" className="mt-4 p-0 text-pink-600">
                    {t("learnMore")} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Lock className="h-10 w-10 text-pink-600" />
                  <CardTitle className="text-pink-700">
                    {t("aiBlockchain")}
                  </CardTitle>
                  <CardDescription>
                    {t("aiBlockchainDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-gray-500">
                    <li>{t("multilingualAI")}</li>
                    <li>{t("blockchainStorage")}</li>
                    <li>{t("realTimeMonitoring")}</li>
                    <li>{t("personalizedInsights")}</li>
                  </ul>
                  <Button variant="link" className="mt-4 p-0 text-pink-600">
                    {t("learnMore")} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Users className="h-10 w-10 text-pink-600" />
                  <CardTitle className="text-pink-700">
                    {t("educationCommunity")}
                  </CardTitle>
                  <CardDescription>{t("educationDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-gray-500">
                    <li>{t("expertWebinars")}</li>
                    <li>{t("healthBlogs")}</li>
                    <li>{t("periodEducation")}</li>
                    <li>{t("peerSupport")}</li>
                  </ul>
                  <Button variant="link" className="mt-4 p-0 text-pink-600">
                    {t("learnMore")} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section>
          <ImpactSection />
        </section>

        {/* Sanitary Pad Locator */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white items-center flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm text-pink-700">
                    {t("freeResources")}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-pink-700">
                    {t("sanitaryPadLocator")}
                  </h2>
                </div>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  {t("sanitaryPadDescription")}
                </p>
                <ul className="space-y-2 text-gray-500">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-pink-500" />
                    <span>{t("realTimeMapping")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-pink-500" />
                    <span>{t("emergencyDelivery")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-pink-500" />
                    <span>{t("communityUpdates")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-pink-500" />
                    <span>{t("healthcareIntegration")}</span>
                  </li>
                </ul>
                <div>
                  <Link to="/pad-locator">
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                    {t("findResources")}

                  </Button>
                  </Link>
                </div>
              </div>
              <img
                alt="Sanitary Pad Locator Map"
                className=""
                src={sanitaryPad}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col py-10 gap-10 h-[100vh]">
          <div className="flex flex-col gap-2 justify-center items-center">
            <h2 className="text-2xl font-semibold">{t("crisisTitle")}</h2>
            <p className="text-center mx-auto w-[51%]">
              {t("crisisDescription")}
            </p>
            <button className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-[5px] w-fit">
              {t("learnMore")} &gt;
            </button>
          </div>
          <div className="womenbg flex justify-evenly text-white items-center">
            <div className="bg-pink-700 h-60 rounded-lg w-[40%] p-6 flex flex-col gap-2">
              <img src={drop} className="h-14 w-14" />
              <h2 className="text-3xl font-semibold">{t("millionWomen")}</h2>
              <p>{t("womenIndia")}</p>
            </div>
            <div className="bg-pink-700 h-60 rounded-lg w-[40%] p-6 flex flex-col gap-2 ">
              <img src={drop} className="h-14 w-14" />
              <h2 className="text-3xl font-semibold">{t("percentGirls")}</h2>
              <p>{t("girlsSchool")}</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-pink-50 to-purple-50 items-center flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm text-pink-700">
                  {t("testimonials")}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-pink-700">
                  {t("hearUsers")}
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("testimonialDescription")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <Card className="border-pink-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mt-6">
                    <img
                      alt="User Avatar"
                      className="rounded-full"
                      height="40"
                      src={women1}
                      style={{
                        aspectRatio: "40/40",
                        objectFit: "cover",
                      }}
                      width="40"
                    />
                    <div>
                      <p className="text-sm font-medium">Sarah J.</p>
                      <p className="text-xs text-gray-500">New York, USA</p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-500">{t("sarahTestimonial")}</p>
                </CardContent>
              </Card>
              <Card className="border-pink-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mt-6">
                    <img
                      alt="User Avatar"
                      className="rounded-full"
                      height="40"
                      src={women2}
                      style={{
                        aspectRatio: "40/40",
                        objectFit: "cover",
                      }}
                      width="40"
                    />
                    <div>
                      <p className="text-sm font-medium">Priya M.</p>
                      <p className="text-xs text-gray-500">Mumbai, India</p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-500">{t("priyaTestimonial")}</p>
                </CardContent>
              </Card>
              <Card className="border-pink-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mt-6">
                    <img
                      alt="User Avatar"
                      className="rounded-full"
                      height="40"
                      src={women3}
                      style={{
                        aspectRatio: "40/40",
                        objectFit: "cover",
                      }}
                      width="40"
                    />
                    <div>
                      <p className="text-sm font-medium">Elena K.</p>
                      <p className="text-xs text-gray-500">Berlin, Germany</p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-500">{t("elenaTestimonial")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        {!isloggedin && (
          <section className="w-full py-12 md:py-24 lg:py-32 bg-pink-600 text-white items-center flex justify-center">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    {t("joinToday")}
                  </h2>
                  <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    {t("takeControl")}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to={"/signup"}>
                    <Button className="bg-white text-pink-600 hover:bg-gray-100">
                      {t("signUpNow")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-pink-700"
                  >
                    {t("learnMore")}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <footer className="border-t bg-muted/40 w-full px-20 py-5">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8">
          <div className="flex flex-col gap-2 md:gap-4">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-primary">SheWell</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("securePrivate")}
            </p>
          </div>
          <div className="ml-auto grid gap-8 sm:grid-cols-3">
            <div className="grid gap-2">
              <h3 className="text-sm font-medium text-primary">
                {t("features")}
              </h3>
              <nav className="grid gap-2 text-sm">
                <Link
                  to="/period-tracker"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("periodTracker")}
                </Link>
                <Link
                  to="/pad-locator"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("padLocator")}
                </Link>
                <Link
                  to="/health-advice"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("healthAdvice")}
                </Link>
              </nav>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium text-primary">
                {t("resources")}
              </h3>
              <nav className="grid gap-2 text-sm">
                <Link
                  to="/chatbot"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("aiAssistant")}
                </Link>
                <Link
                  to="/health-advice"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("education")}
                </Link>
                <Link
                  to="/health-advice"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("blog")}
                </Link>
              </nav>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium text-primary">{t("legal")}</h3>
              <nav className="grid gap-2 text-sm">
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("termsService")}
                </Link>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("contact")}
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
