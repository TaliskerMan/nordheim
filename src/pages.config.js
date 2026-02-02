import Contacts from './pages/Contacts';
import Import from './pages/Import';
import AuditLogs from './pages/AuditLogs';
import LicenseManager from './pages/LicenseManager';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Contacts": Contacts,
    "Import": Import,
    "AuditLogs": AuditLogs,
    "Licenses": LicenseManager,
}

export const pagesConfig = {
    mainPage: "Contacts",
    Pages: PAGES,
    Layout: __Layout,
};