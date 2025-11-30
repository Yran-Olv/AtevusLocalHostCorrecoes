import React from "react";
import { FiUpload, FiFile } from "react-icons/fi";
import ContactImport from "../../components/ContactImport";
import MainContainer from "../../components/MainContainer";
import "./import.css";

const ContactImportPage = () => {
    return (
        <MainContainer className="contact-import-container">
            <div className="contact-import-header">
                <h1 className="contact-import-title">
                    <FiUpload className="contact-import-title-icon" />
                    Importar contatos de arquivo
                </h1>
            </div>
            <div className="contact-import-content">
                <ContactImport />
            </div>
        </MainContainer>
    );
}

export default ContactImportPage;