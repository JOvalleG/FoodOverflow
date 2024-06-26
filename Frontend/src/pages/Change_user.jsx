import { useRef, useState } from "react";
import "./Register.css";
import "./Change_password.css";
import iconoImg from "../assets/logo.png";
import { Link } from "react-router-dom";
import axios from "../api/axios.jsx";
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';

function Change_user() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newUsername: ""
  });

  const [errMsg, setErrMsg] = useState("");
  const errRef = useRef();

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cookies = new Cookies();
    const jwt = cookies.get("auth_token");
    const url =  import.meta.env.VITE_API_URL;
    const urlFront =  import.meta.env.VITE_FRONT_URL;

    try {
      const response = await axios.post(`${url}/update_username/`, {
        jwt: jwt,
        password: formData.currentPassword,
        new_username: formData.newUsername
      });
      
      if (response.data.type === "SUCCESS") {
        cookies.remove('auth_token', { path: '/' });
        Swal.fire({
          title: `<strong>${response.data.message} Inicia sesión nuevamente.</strong>`,
          icon: "success",
          confirmButtonColor: "#27ae60",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = `${urlFront}/login`;
          } else if (result.isDenied) {
            window.location.href = `${urlFront}/login`;
          }
        });
      } else {
        Swal.fire({
          title: `<strong>${response.data.message}</strong>`,
          icon: "error",
          timer: 4000,
          confirmButtonColor: "#ff0000",
        });
      }
    } catch (error) {
      console.error("Error al cambiar el nombre de usuario:", error);
      setErrMsg("Ocurrió un error al cambiar el nombre de usuario. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div className="register">
      <div className="form">
        <div className="icon">
          <img
            src={iconoImg}
            alt="Icono de la página"
            style={{ width: "45px", height: "50px" }}
          />
        </div>
        <h1>Crea tu nuevo nombre de usuario</h1>
        <h1
          ref={errRef}
          className={errMsg ? "errmsg li-h1-error " : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="currentPassword">Contraseña actual</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              placeholder="Introduce tu contraseña actual"
              required
              onChange={handleInput}
            />
          </div>
          <div className="input-group">
            <label htmlFor="newUsername">Nuevo nombre de usuario</label>
            <input
              type="text"
              id="newUsername"
              name="newUsername"
              placeholder="Introduce tu nuevo nombre de usuario"
              required
              minLength={5}
              onChange={handleInput}
            />
          </div>
          <p className="note">
            El nombre de usuario debe tener más de 5 caracteres.
          </p>
          <br />
          <button type="submit" className="register-button center-button">
            <strong>Cambiar nombre de usuario</strong>
          </button>
        </form>
        <center>
          <p className="loginRegister">
            ¿Deseas volver a los datos de usuario? <Link to={"/profile"}>Perfil</Link>
          </p>
        </center>
      </div>
    </div>
  );
}

export default Change_user;
