/**
 * @module pages.Home
 * @description Route-level landing page for unauthenticated visitors.
 */
import FlexTron from "../components/FlexTron";
import TextCard from "../components/TextCard";
import { Button } from "rsuite";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <FlexTron
        title="MERN Template (Modernized)"
        subtitle="React 18, Vite, RSuite v5, JWT auth with refresh tokens, and dashboard layout out of the box."
      >
        <Button appearance="primary" size="lg" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </Button>
      </FlexTron>

      <TextCard
        title="Batteries Included"
        subtitle="Auth, protected routes, theming, and layout are already wired up."
      >
        <p>Use this template as the base for hackathons, client projects, or new ideas.</p>
      </TextCard>
    </div>
  );
}
