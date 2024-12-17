// import React, { useState } from "react";
// import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
// import queries from "../queries"; // Import your query definitions
// import { useAuth } from "../context/AuthContext";

// const Newsfeed = () => {
//   const { authState } = useAuth();
//   const userId = authState.user.id;
//   const { loading, error, data, refetch } = useQuery(queries.GET_UPDATES);
//   const [commentsByUpdate, setCommentsByUpdate] = useState([]);
//   const [newComment, setNewComment] = useState("");
//   const [activeUpdateId, setActiveUpdateId] = useState(null);
//   const [getUpdateById, { loading: commentsLoading, error: commentsError }] =
//     useLazyQuery(queries.GET_UPDATE_BY_ID);

//   const [addComment] = useMutation(queries.ADD_COMMENT, {
//     refetchQueries: [queries.GET_UPDATE_BY_ID],
//   });

//   const [removeComment] = useMutation(queries.REMOVE_COMMENT, {
//     refetchQueries: [queries.GET_UPDATE_BY_ID],
//   });

//   if (loading) return <p>Loading updates...</p>;
//   if (error) return <p>Error loading updates. Please try again later.</p>;

//   // Fetch comments dynamically for a specific update
//   // const fetchComments = async (updateId) => {
//   //   setActiveUpdateId(updateId);
//   //   try {
//   //     // const { data } = await queries.client.query({
//   //     //   query: queries.GET_UPDATE_BY_ID,
//   //     //   variables: { id: updateId },
//   //     //   fetchPolicy: "network-only",
//   //     // });

//   //     const { data } = await getUpdateById({
//   //       variables: { id: updateId },
//   //       fetchPolicy: "network-only",
//   //     });

//   //     setCommentsByUpdate((prev) => ({
//   //       ...prev,
//   //       [updateId]: data?.getUpdateById?.comments || [],
//   //     }));
//   //   } catch (error) {
//   //     console.error("Error fetching comments:", error);
//   //   }
//   // };

//   const fetchComments = async (updateId) => {
//     setActiveUpdateId(updateId); // Mark the active update
//     try {
//       const { data: updateData } = await getUpdateById({
//         variables: { id: updateId },
//         fetchPolicy: "network-only",
//       });

//       // Store comments for this specific updateId in the state
//       setCommentsByUpdate((prev) => ({
//         ...prev,
//         [updateId]: data?.getUpdateById?.comments || [],
//       }));
//     } catch (error) {
//       console.error("Error fetching comments:", error);
//     }
//   };

//   // Add a new comment
//   const handleAddComment = async (updateId) => {
//     if (!newComment.trim()) return;

//     try {
//       await addComment({
//         variables: {
//           commenterId: userId, // Replace with dynamic user ID
//           content: newComment.trim(),
//           destinationId: updateId,
//         },
//       });
//       fetchComments(updateId); // Refresh comments
//       await refetch(); // Refresh newsfeed
//       setNewComment("");
//     } catch (error) {
//       console.error("Error adding comment:", error);
//     }
//   };

//   // Remove a comment
//   const handleRemoveComment = async (commentId, updateId) => {
//     try {
//       await removeComment({
//         variables: { id: commentId },
//       });
//       fetchComments(updateId); // Refresh comments
//     } catch (error) {
//       console.error("Error removing comment:", error);
//     }
//   };

//   // Render comments section for a specific update
//   const renderComments = (updateId) => {
//     // const comments = data?.comments || [];
//     const comments = commentsByUpdate || [];
//     console.log("data", data);
//     console.log("comments", comments);

//     return (
//       <div className="comments-section">
//         {comments.length > 0 ? (
//           comments.map((comment) => (
//             <div key={comment._id} className="comment">
//               <p>
//                 <strong>
//                   {comment.commenter
//                     ? `${comment.commenter.firstName} ${comment.commenter.lastName}`
//                     : "Unknown User"}
//                 </strong>
//                 : {comment.content}
//               </p>
//               <button
//                 onClick={() => handleRemoveComment(comment._id, updateId)}
//                 className="btn-remove"
//               >
//                 Remove
//               </button>
//             </div>
//           ))
//         ) : (
//           <p>No comments yet.</p>
//         )}

//         {/* Add Comment Input */}
//         <div className="add-comment">
//           <input
//             type="text"
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             placeholder="Write a comment..."
//           />
//           <button
//             onClick={() => handleAddComment(updateId)}
//             className="btn-add"
//           >
//             Add Comment
//           </button>
//         </div>
//       </div>
//     );
//   };

//   // Render an individual update
//   const renderUpdate = (update) => (
//     <div key={update._id} className="news-card">
//       <div className="news-header">
//         <div className="user-avatar">{update.posterUser.firstName[0]}</div>
//         <div>
//           <h3>
//             {update.posterUser.firstName} {update.posterUser.lastName}
//           </h3>
//           <p className="news-meta">
//             {update.posterUser.role} · {update.posterUser.department}
//           </p>
//         </div>
//       </div>
//       <div className="news-body">
//         <h4>{update.subject.replace(/_/g, " ")}</h4>
//         <p>{update.content}</p>
//         <p>
//           <strong>Project:</strong> {update.project.title}
//         </p>
//       </div>
//       <div className="news-footer">
//         <p className="news-date">
//           {new Date(update.postedDate).toLocaleDateString()}
//         </p>
//         <button
//           className="btn-view-comments"
//           onClick={() => fetchComments(update._id)}
//         >
//           View Comments ({update.numOfComments})
//         </button>
//       </div>
//       {/* Render comments dynamically */}
//       {activeUpdateId && renderComments(update._id)}
//       {/* {renderComments(update._id)} */}
//     </div>
//   );

//   // Render the full newsfeed
//   return (
//     <div className="newsfeed">
//       <div className="newsfeed-content">
//         <h2>Newsfeed</h2>
//         {data.updates.length > 0 ? (
//           data.updates.map((update) => renderUpdate(update))
//         ) : (
//           <p>No updates available at the moment.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Newsfeed;
import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import queries from "../queries";
import { useAuth } from "../context/AuthContext";

const Newsfeed = () => {
  const { authState } = useAuth();
  const userId = authState.user.id; // User ID for adding comments
  const { loading, error, data, refetch } = useQuery(queries.GET_UPDATES);

  const [newComment, setNewComment] = useState(""); // New comment input
  const [activeUpdateId, setActiveUpdateId] = useState(null); // Active update for comments

  const [addComment] = useMutation(queries.ADD_COMMENT);
  const [removeComment] = useMutation(queries.REMOVE_COMMENT);

  if (loading) return <p>Loading updates...</p>;
  if (error) return <p>Error loading updates. Please try again later.</p>;

  // Add a new comment
  const handleAddComment = async (updateId) => {
    if (!newComment.trim()) return;

    try {
      await addComment({
        variables: {
          commenterId: userId,
          content: newComment.trim(),
          destinationId: updateId,
        },
      });
      setNewComment(""); // Reset input
      refetch(); // Refresh the entire newsfeed data
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Remove a comment
  const handleRemoveComment = async (commentId) => {
    try {
      await removeComment({
        variables: { id: commentId },
      });
      refetch(); // Refresh the entire newsfeed data
    } catch (error) {
      console.error("Error removing comment:", error);
    }
  };

  // Render comments section
  const renderComments = (comments, updateId) => {
    return (
      <div className="comments-section">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="comment">
              <p>
                <strong>
                  {`${comment.commenter.firstName} ${comment.commenter.lastName}`}
                  :
                </strong>{" "}
                {comment.content}
              </p>
              <button
                onClick={() => handleRemoveComment(comment._id)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}

        {/* Add Comment Input */}
        <div className="add-comment">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button
            onClick={() => handleAddComment(updateId)}
            className="btn-add"
          >
            Add Comment
          </button>
        </div>
      </div>
    );
  };

  // Render individual updates
  const renderUpdate = (update) => (
    <div key={update._id} className="news-card">
      <div className="news-header">
        <div className="user-avatar">{update.posterUser.firstName[0]}</div>
        <div>
          <h3>
            {update.posterUser.firstName} {update.posterUser.lastName}
          </h3>
          <p className="news-meta">
            {update.posterUser.role} · {update.posterUser.department}
          </p>
        </div>
      </div>
      <div className="news-body">
        <h4>{update.subject.replace(/_/g, " ")}</h4>
        <p>{update.content}</p>
        <p>
          <strong>Project:</strong> {update.project.title}
        </p>
      </div>
      <div className="news-footer">
        <p className="news-date">
          {new Date(update.postedDate).toLocaleDateString()}
        </p>
        <button
          className="btn-view-comments"
          onClick={() =>
            setActiveUpdateId((prev) =>
              prev === update._id ? null : update._id
            )
          }
        >
          {activeUpdateId === update._id ? "Hide Comments" : "View Comments"}
        </button>
      </div>

      {/* Conditionally render comments */}
      {activeUpdateId === update._id &&
        renderComments(update.comments, update._id)}
    </div>
  );

  // Render the full newsfeed
  return (
    <div className="newsfeed">
      <div className="newsfeed-content">
        <h2>Newsfeed</h2>
        {data.updates.length > 0 ? (
          data.updates.map((update) => renderUpdate(update))
        ) : (
          <p>No updates available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default Newsfeed;
