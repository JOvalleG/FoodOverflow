import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiArrowCircleDown, HiArrowCircleUp } from "react-icons/hi";
import axios from "../api/axios.jsx";
import { BiComment } from "react-icons/bi";
import "./DetallesPublicacion.css";
import Cookies from "universal-cookie";
import Comentario from "../components/Comentario";

function DetallesPublicacion() {
  const { id } = useParams();
  const [author, setAuthor] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [numComments, setNumComments] = useState();
  const [comments, setComments] = useState([]);
  const [score, setScore] = useState();
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [voted, setVoted] = useState(false);
  const [lastVote, setLastVote] = useState(0);
  const [comment, setComment] = useState('');
  const [voteStatus, setVoteStatus] = useState(0);

  const cookies = new Cookies();
  const jwt = cookies.get("auth_token");

  const ocultarAlerta = () => {
    setAlertVisible(false);
  };

  const handleChangeComment = (event) => {
    const comment = event.target.value;
    setComment(comment);
  };

  const handleInputCommentClick = () => {
    setShowPlaceholder(false);
    setShowButtons(true);
  };

  const discartComment = () => {
    setComment("");
    setShowPlaceholder(true);
    setShowButtons(false);
    ocultarAlerta();
  };

  const handleInputCommentCancel = () => {
    if (!comment) {
      setShowPlaceholder(true);
      setShowButtons(false);
    } else {
      setAlertVisible(true);
    }
  };

  const handleVote = async (voteType) => {
    try {
        const voteToSend = voted && voteType === lastVote ? 0 : voteType;
        const response = await axios.post("http://127.0.0.1:8000/vote/publication/", {
            post_id: id,
            jwt: jwt,
            vote_type: voteToSend
        });

        if (response.data.type === "SUCCESS") {
            if (voteToSend === 0) {
                setVoted(false);
                setLastVote(0);
                setVoteStatus(0);
                setScore(score - lastVote);
            } else {
                setVoted(true);
                setLastVote(voteToSend);
                setVoteStatus(voteToSend);

                let newScore = score + voteToSend;
                if (voted && lastVote !== 0) {
                    newScore -= lastVote;
                }
                setScore(newScore);
            }
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        console.error("Error al realizar la solicitud:", error);
    }
};

  useEffect(() => {
    obtenerDetallesPublicacion(id);
  }, []);

  const obtenerDetallesPublicacion = async (id) => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/publication/", {
        publication_id: id,
        jwt: jwt,
      });
      if (res.data.type === "SUCCESS") {
        setAuthor(res.data.username);
        setTitle(res.data.title);
        setDescription(res.data.description);
        setNumComments(res.data.numComments);
        setComments(res.data.publication_comments);
        setScore(res.data.score);
        setLastVote(res.data.vote_type > 0 ? 1 : (res.data.vote_type < 0 ? -1 : 0));
        setVoteStatus(res.data.vote_type);
        const userHasVoted = res.data.vote_type !== 0;
        setVoted(userHasVoted);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };

  const submitComment = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/comment/publication/",
        {
          post_id: id,
          content: comment,
          jwt: jwt,
        }
      );
      if (res.data.type === "SUCCESS") {
        alert(res.data.message);
        setComment("");
        setShowPlaceholder(true);
        setShowButtons(false);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };

  return (
    <div className="dp-container">
      <div className="dp-post">
        <div className="dp-score">
          <button className={`vote-button ${voted && lastVote === 1 ? 'voted' : ''} ${voteStatus === 1 ? 'user-voted' : ''}`} onClick={() => handleVote(1)}>
            <HiArrowCircleUp size={30} />
          </button>
          {score}
          <button className={`vote-button ${voted && lastVote === -1 ? 'voted' : ''} ${voteStatus === -1 ? 'user-voted' : ''}`} onClick={() => handleVote(-1)}>
            <HiArrowCircleDown size={30} />
          </button>
        </div>
        <div className="dp-contenido">
          <span className="dp-userName">{author}</span>
          <span className="dp-title">{title}</span>
          <div className="dp-description">{description}</div>
          <div className="dp-numComments">
            <BiComment />
            {numComments}
          </div>
        </div>
      </div>
      <div className="dp-makeComment">
        <input
          placeholder={showPlaceholder ? "Escribe un comentario..." : ""}
          className="dp-input-comment"
          type="text"
          value={comment}
          onChange={handleChangeComment}
          onClick={handleInputCommentClick}
        />
        {showButtons && (
          <div className="dp-makeComment-buttons-cancel-comment">
            <button
              className="dp-button-cancel"
              onClick={handleInputCommentCancel}
            >
              Cancelar
            </button>
            <button className="dp-button-comment" onClick={submitComment}>
              Comentar
            </button>
          </div>
        )}
      </div>
      <div className="dp-comments">Comentarios</div>
      {alertVisible && (
        <div className="dp-alert-cancel">
          <div className="dp-alert-cancel-content">
            <div className="dp-alert-cancel-content-title">
              <span className="dp-title">¿Descartar comentario?</span>
              <span className="close" onClick={ocultarAlerta}>
                &times;
              </span>
            </div>
            <div className="dp-description">
              Tienes un comentario en progreso, ¿estás seguro de que quieres
              descartarlo?
            </div>
            <div className="dp-alert-cancel-buttons">
              <button className="dp-button-cancel" onClick={ocultarAlerta}>
                Cancelar
              </button>
              <button className="dp-button-discard" onClick={discartComment}>
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
      {comments.map((comment) => (
        <Comentario
          key={comment.comment_id}
          comment_id={comment.comment_id}
          comment_content={comment.comment_content}
          comment_user={comment.comment_user}
          response_list={comment.response_list}
        />
        ))
      }
    </div>
  );
}
export default DetallesPublicacion;
