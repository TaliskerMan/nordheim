import Contacts from './pages/Contacts';
import Import from './pages/Import';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Contacts": Contacts,
    "Import": Import,
}

export const pagesConfig = {
    mainPage: "Contacts",
    Pages: PAGES,
    Layout: __Layout,
};