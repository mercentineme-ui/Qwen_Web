import React from "react";
import { StoreProvider, useHashRoute } from "./lib/store";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Expertise from "./components/Expertise";
import CreativeCore from "./components/CreativeCore";
import ShowReel from "./components/ShowReel";
import AILab from "./components/AILab";
import Arc from "./components/Arc";
import { Contact, Footer, HowIBuild } from "./components/Closing";
import Editor from "./components/Editor";

function Site() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--page)" }}>
      <Header />
      <main>
        <Hero />
        <Expertise />
        <CreativeCore />
        <ShowReel />
        <AILab />
        <Arc />
        <HowIBuild />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  const [route] = useHashRoute();
  if (route.startsWith("#/edit")) return <Editor />;
  return <Site />;
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}
