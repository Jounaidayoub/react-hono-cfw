import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./providers/theme-provider";
import { QueryProvider } from "./providers/query-provider";
import { SessionProvider } from "./providers/session-provider";
import { ProfileProvider } from "./providers/profile-provider";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<ThemeProvider storageKey="xplore-ui-theme" defaultTheme="dark">
		<QueryProvider>
			<SessionProvider>
				<ProfileProvider>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</ProfileProvider>
			</SessionProvider>
		</QueryProvider>
	</ThemeProvider>,
);
