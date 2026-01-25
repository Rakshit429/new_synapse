from enum import Enum as PyEnum

class RoleName(PyEnum):
    OVERALL_COORDINATOR = "overall coordinator"
    COORDINATOR = "coordinator"
    EXECUTIVE = "executive"
    GENERAL_SECRETARY = "general secretary"
    DEPUTY_GENERAL_SECRETARY = "deputy general secretary"
    SECRETARY = "secretary"
    CONVENER = "convener"
    PRESIDENT = "president"
    VICE_PRESIDENT = "vice president"
    TEAM_HEAD = "team head"
    ACHEAD = "achead"

class OrgType(PyEnum):
    CLUB = "club"
    BOARD = "board"
    SOCIETY = "society"
    FEST = "fest"
    DEPARTMENT = "department"

class OrgName(PyEnum):
    # Apex Councils / Boards
    STUDENT_AFFAIRS_COUNCIL = "student affairs council"
    BOARD_FOR_STUDENT_WELFARE = "board for student welfare"
    BOARD_FOR_SPORTS_ACTIVITIES = "board for sports activities"
    BOARD_FOR_RECREATIONAL_AND_CREATIVE_ACTIVITIES = "board for recreational and creative activities"
    BOARD_FOR_STUDENT_PUBLICATIONS = "board for student publications"
    CO_CURRICULAR_AND_ACADEMIC_INTERACTION_COUNCIL = "co-curricular and academic interaction council"

    # CAIC Technical Clubs
    DEVCLUB = "devclub"
    ROBOTICS_CLUB = "robotics club"
    AEROMODELLING_CLUB = "aeromodelling club"
    BUSINESS_AND_CONSULTING_CLUB = "business and consulting club"
    ECONOMICS_CLUB = "economics club"
    PHYSICS_AND_ASTRONOMY_CLUB = "physics and astronomy club"
    ALGORITHMS_AND_COMPUTING_CLUB = "algorithms and computing club"
    ARIES = "aries"
    IGEM = "igem"
    HYPERLOOP_CLUB = "hyperloop club"

    # Academic / Departmental Societies
    MATHSOC = "mathsoc"
    ACES_ACM = "aces acm"
    CHEMICAL_ENGINEERING_SOCIETY = "chemical engineering society"
    MECHANICAL_ENGINEERING_SOCIETY = "mechanical engineering society"
    ELECTRICAL_ENGINEERING_SOCIETY = "electrical engineering society"
    CIVIL_ENGINEERING_FORUM = "civil engineering forum"
    MATERIALS_SCIENCE_ENGINEERING_SOCIETY = "materials science and engineering society"
    BIOTECHNOLOGY_SOCIETY = "biotechnology society"
    PHYSICS_SOCIETY = "physics society"
    TEXTILE_ENGINEERING_SOCIETY = "textile engineering society"
    ENERGY_SOCIETY = "energy society"

    # BRCA Cultural Clubs
    MUSIC_CLUB = "music club"
    DANCE_CLUB = "dance club"
    DRAMATICS_CLUB = "dramatics club"
    LITERARY_CLUB = "literary club"
    DEBATING_CLUB = "debating club"
    PHOTOGRAPHY_AND_FILMS_CLUB = "photography and films club"
    FINE_ARTS_AND_CRAFTS_CLUB = "fine arts and crafts club"
    DESIGN_CLUB = "design club"
    QUIZZING_CLUB = "quizzing club"
    HINDI_SAMITI = "hindi samiti"
    SPIC_MACAY = "spic macay"

    # Independent Student Groups
    INDRADHANU = "indradhanu"

    # ✅ NEW: Fests
    RENDEZVOUS = "rendezvous"
    TRYST = "tryst"
    BECON = "becon"
    LITERATI = "literati"
    CSE = "cse"
    EE = "ee"
    ME = "me"
    CE = "ce"
    CHE = "che"
    DBEB = "dbeb"
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"
    MATHS = "maths"
    TEXTILE = "textile"