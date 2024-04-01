from core import recommendation
from models.crew import Crew, CrewMember
from models.user import UserAuthorizationData


def add_user_to_crew(user_auth: UserAuthorizationData, crew: Crew, specified_name: str):
    CrewMember.create(
        crew=crew,
        user=user_auth.user,
        data=user_auth,
        specified_name=specified_name,
    )

    suggestions = recommendation.recommend_n_crew_festivals(
        users=[member.data for member in crew.members if member.is_active],
        user_n=50,
        result_n=5,
    )
    crew.suggestions = suggestions
    crew.save()


def delete_crew(crew: Crew):
    for crew_member in crew.members:
        crew_member.is_active = False
        crew_member.save()
    crew.active = False
    crew.save()


def remove_member_from_crew(crew_member: CrewMember, crew: Crew):
    crew_member.is_active = False
    crew_member.save()

    suggestions = recommendation.recommend_n_crew_festivals(
        users=[member.data for member in crew.members if member.is_active],
        user_n=50,
        result_n=5,
    )
    crew.suggestions = suggestions
    crew.save()
