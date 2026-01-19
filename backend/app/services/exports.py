import csv
import io
from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User

def generate_event_registration_csv(db: Session, event_id: int) -> io.StringIO:
    """
    Generates a CSV file object for a specific event's registrations.
    Columns: Name, Email, Entry No, Registered At, Custom Answers...
    """
    
    # 1. Fetch Data
    event = db.query(Event).filter(Event.id == event_id).first()
    registrations = db.query(Registration).filter(Registration.event_id == event_id).all()
    
    if not event:
        raise ValueError("Event not found")

    # 2. Prepare CSV Buffer
    output = io.StringIO()
    writer = csv.writer(output)
    
    # 3. Define Headers
    # Base headers
    headers = ["Entry Number", "Name", "Email", "Department", "Hostel", "Registered At"]
    
    # Add dynamic headers from Custom Form (e.g. "T-Shirt Size")
    custom_keys = []
    if event.custom_form_schema:
        # schema looks like [{"label": "Size", ...}]
        custom_keys = [q.get("label") for q in event.custom_form_schema]
        headers.extend(custom_keys)
        
    writer.writerow(headers)
    
    # 4. Write Rows
    for reg in registrations:
        user = reg.user
        row = [
            user.entry_number,
            user.name,
            user.email,
            user.department,
            user.hostel,
            reg.registered_at.strftime("%Y-%m-%d %H:%M")
        ]
        
        # Add custom answers based on keys
        # custom_answers is a Dict {"Size": "M"}
        for key in custom_keys:
            answer = reg.custom_answers.get(key, "") if reg.custom_answers else ""
            row.append(answer)
            
        writer.writerow(row)
        
    output.seek(0) # Rewind buffer to start
    return output