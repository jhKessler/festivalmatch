from backend.models.user import UserAuthorizationData


def build_user_home_preview(user_auth: UserAuthorizationData) -> dict:
    top_2_suggestions = []
    for suggestion in user_auth.json:
        top_2_suggestions.append(
            {
                "name": suggestion["name"],
                "location": suggestion["location"],
                "date": suggestion["date_str"],
                "img": suggestion["headliner_img_url"],
            }
        )
        if len(top_2_suggestions) == 2:
            break
    active_memberships = [
        membership for membership in user_auth.user.memberships if membership.is_active
    ]
    if not active_memberships:
        crew_response = None
    else:
        crew_with_most_members = max(
            (membership.crew for membership in active_memberships),
            key=lambda crew: len(crew.members),
        )
        crew_response = {
            "name": crew_with_most_members.name,
            "id": crew_with_most_members.id,
            "member_pictures": [
                member.user.picture_url for member in crew_with_most_members.members
            ],
        }

    return {"individual": top_2_suggestions, "crew": crew_response}


def get_user_crews(user_auth: UserAuthorizationData) -> dict:
    # select all crews where user is a member
    response = []
    for membership in user_auth.user.memberships:
        if not membership.crew.active:
            continue
        if not membership.is_active:
            continue
        # select crew members of crew
        profile_pictures = [
            member.user.picture_url for member in membership.crew.members
        ]
        response.append(
            {
                "name": membership.crew.name,
                "id": membership.crew.id,
                "profile_pictures": profile_pictures,
            }
        )
    return response
