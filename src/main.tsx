import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import QueryProvider from "@/providers/query-provider";
import ReduxProvider from "@/providers/redux-provider";
import ToasterProvider from "@/providers/toaster-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/index.css";
import App from "@/App";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <ReduxProvider>
          <ToasterProvider>
            <App />
          </ToasterProvider>
        </ReduxProvider>
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>,
)
