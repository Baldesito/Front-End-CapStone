import React, { useState, useEffect } from "react";
import { Dropdown, Form, Button, Modal, Toast } from "react-bootstrap";
import { FaUserEdit, FaSignOutAlt, FaEye, FaEyeSlash } from "react-icons/fa";

const ProfileDropdown = ({ user, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (formData.password && formData.password.length < 6) {
      alert("La password deve contenere almeno 6 caratteri.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/utenti/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setIsEditing(false);
        setShowToast(true);
        localStorage.setItem("user", JSON.stringify({ ...user, ...formData }));
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert("Errore nell'aggiornamento del profilo.");
      }
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore di connessione.");
    }
  };

  if (!user) return null;

  return (
    <>
      <Dropdown align="end">
        <Dropdown.Toggle
          id="dropdown-profile"
          className="d-flex align-items-center border-0 bg-transparent p-0"
        >
          <div className="profile-avatar me-1">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <span className="dropdown-arrow">▼</span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="dropdown-menu-custom">
          {!isEditing ? (
            <>
              <div className="profile-info">
                <p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="35"
                    height="35"
                    fill="currentColor"
                    class="bi me-3 text-primary bi-person-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                    <path
                      fill-rule="evenodd"
                      d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                    />
                  </svg>
                  <strong>Username: </strong> {user?.username}
                </p>
                <p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="35"
                    height="35"
                    fill="currentColor"
                    class="bi text-primary me-3 bi-envelope-at"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z" />
                    <path d="M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.21C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648m-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z" />
                  </svg>
                  <strong>Email:</strong> {user?.email}
                </p>
              </div>
              <div className="profile-buttons">
                <Button
                  className="btn rounded-pill"
                  variant="outline-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Modifica{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-pencil"
                    viewBox="0 0 16 16"
                  >
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                  </svg>
                </Button>
                <Button
                  className="btn rounded-pill"
                  variant="danger"
                  onClick={() => setShowConfirmLogout(true)}
                >
                  Disconnetti{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-door-closed-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M12 1a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2a1 1 0 0 1 1-1zm-2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                  </svg>
                </Button>
              </div>
            </>
          ) : (
            <div className="profile-edit-container">
              <Form.Group className="mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  fill="currentColor"
                  class="bi me-1 pb-1 text-primary bi-person-circle"
                  viewBox="0 0 16 16"
                >
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                  <path
                    fill-rule="evenodd"
                    d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                  />
                </svg>
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  fill="currentColor"
                  class="bi text-primary me-1 pb-1 bi-envelope-at"
                  viewBox="0 0 16 16"
                >
                  <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z" />
                  <path d="M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.21C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648m-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z" />
                </svg>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nuova Password</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    className="me-2"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Lascia vuoto se non vuoi cambiarla"
                  />
                  <Button
                    className="me-auto"
                    variant="light"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>
              <div className="profile-buttons">
                <Button
                  className="btn rounded-pill"
                  variant="outline-primary"
                  onClick={() => setIsEditing(false)}
                >
                  Annulla
                </Button>
                <Button
                  className="rounded-pill"
                  variant="primary"
                  onClick={handleSave}
                >
                  Salva Modifiche
                </Button>
              </div>
            </div>
          )}
        </Dropdown.Menu>
      </Dropdown>

      {/* Modal conferma logout */}
      <Modal
        show={showConfirmLogout}
        onHide={() => setShowConfirmLogout(false)}
        centered
      >
        <Modal.Header closeButton className="header-accedi">
          <Modal.Title>Sei sicuro di voler disconnetterti ?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body text-white text-center">
          Questa azione ti farà uscire dal tuo account.
        </Modal.Body>
        <Modal.Footer className="modal-body border-0">
          <Button
            className="profile-buttons rounded-pill "
            variant="outline-primary"
            onClick={() => setShowConfirmLogout(false)}
          >
            Annulla
          </Button>
          <Button
            className="rounded-pill"
            variant="danger"
            onClick={() => {
              setShowConfirmLogout(false);
              onLogout();
            }}
          >
            Disconnettiti
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast conferma salvataggio */}
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}
      >
        <Toast.Body>Profilo aggiornato con successo!</Toast.Body>
      </Toast>
    </>
  );
};

export default ProfileDropdown;
