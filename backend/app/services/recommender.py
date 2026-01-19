from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.user import User
from app.models.registration import Registration
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

def get_event_recommendations(db: Session, user_id: int, limit: int = 5):
    """
    Returns a list of Event objects sorted by relevance to the user.
    Logic: Content-Based Filtering using Event Tags + Description.
    """
    
    # 1. Fetch User & History
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    # Get all future events
    all_events = db.query(Event).all()
    if not all_events:
        return []

    # 2. Build User Profile String
    # Combine explicitly selected interests
    user_interests = " ".join(user.interests) if user.interests else ""
    
    # Add tags from events they previously registered for
    # (In a real app, weigh this by feedback rating)
    past_regs = db.query(Registration).filter(Registration.user_id == user_id).all()
    past_event_ids = [r.event_id for r in past_regs]
    
    past_events_tags = []
    for reg in past_regs:
        if reg.event.tags:
            past_events_tags.extend(reg.event.tags)
            
    user_profile_str = user_interests + " " + " ".join(past_events_tags)

    # 3. Handle "Cold Start" (No data)
    # If user has no interests and no history, just return upcoming events sorted by date
    if not user_profile_str.strip():
        return sorted(all_events, key=lambda x: x.date)[:limit]

    # 4. Build Event Corpus (Text data for AI)
    # We combine Name + Description + Tags for better matching
    event_corpus = []
    active_events = [] # Keep track of event objects matching corpus indices
    
    for e in all_events:
        # Skip events user already registered for (optional)
        if e.id in past_event_ids:
            continue
            
        tags_str = " ".join(e.tags) if e.tags else ""
        # Create a "soup" of words: "Coding Workshop Python DevClub..."
        content = f"{e.name} {e.description} {tags_str}"
        event_corpus.append(content)
        active_events.append(e)

    if not event_corpus:
        return []

    # 5. TF-IDF & Cosine Similarity
    # Add user profile as the first item to compare against others
    corpus = [user_profile_str] + event_corpus
    
    try:
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(corpus)
        
        # Compare User (Index 0) vs All Events (Index 1 to End)
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
        
        # Get scores: [(Index, Score), ...]
        sim_scores = list(enumerate(cosine_sim[0]))
        
        # Sort by score (Highest first)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Get top N events
        top_indices = [i[0] for i in sim_scores[:limit]]
        recommended_events = [active_events[i] for i in top_indices]
        
        return recommended_events

    except ValueError:
        # Fallback if TF-IDF fails (e.g., empty words)
        return active_events[:limit]