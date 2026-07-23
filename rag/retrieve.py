import numpy as np
import joblib
from sklearn.metrics.pairwise import cosine_similarity
from embeddings.embedding_utils import create_embedding


#load the save embeddings dataframe
df = joblib.load("data/embeddings/embeddings.pkl")

def retrieve(incoming_query, top_k = 5):
    # create embedding for the query
    question_embedding = create_embedding([incoming_query])[0]

    # cosine similarity between query
    similarity = cosine_similarity(np.vstack(df['embedding']), [question_embedding]).flatten()
    
    top_indices = similarity.argsort()[-top_k:][::-1]

    
    return df.iloc[top_indices]

print("Retreived successfully")