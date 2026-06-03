import json
from pathlib import Path


# Content taxonomy. Each key is a pillar and each value contains its subpillars.
subpillars = {
    "Food Porn": [
        "Cheese Pulls",
        "Syrup Pours",
        "Runny Yolks",
        "Stacked Plates",
        "Close Up Bites",
    ],
    "Coffee": [
        "Espresso",
        "Cappuccino",
        "Flat White",
        "Latte Art",
        "Cold Brew",
    ],
    "Drinks": [
        "Mimosas",
        "Fresh Juices",
        "Smoothies",
        "Mocktails",
        "Lemonades",
    ],
    "Brunch Lifestyle": [
        "Late Breakfasts",
        "Brunch Dates",
        "Group Tables",
        "Slow Mornings",
        "Midday Treats",
    ],
    "Tourism": [
        "Visitor Guides",
        "Local Landmarks",
        "Hidden Gems",
        "Travel Stops",
        "Day Trips",
    ],
    "Instagrammable Spaces": [
        "Photo Corners",
        "Table Aesthetics",
        "Wall Features",
        "Natural Light",
        "Outdoor Shots",
    ],
    "Social Proof": [
        "Reviews",
        "Customer Reactions",
        "Busy Tables",
        "Best Sellers",
        "Press Mentions",
    ],
    "Community": [
        "Regular Guests",
        "Neighborhood",
        "Local Partners",
        "Community Moments",
        "Local Support",
    ],
    "Matcha": [
        "Matcha Latte",
        "Iced Matcha",
        "Matcha Desserts",
        "Matcha Rituals",
        "Matcha Quality",
    ],
    "Behind The Scenes": [
        "Prep Work",
        "Kitchen Moments",
        "Coffee Making",
        "Opening Routine",
        "Service Flow",
    ],
    "Team": [
        "Baristas",
        "Chefs",
        "Servers",
        "Team Favorites",
        "Staff Stories",
    ],
    "Experience": [
        "First Visit",
        "Service Moments",
        "Atmosphere",
        "Menu Journey",
        "Customer Feelings",
    ],
    "Couples": [
        "Brunch Dates",
        "Anniversaries",
        "Shared Plates",
        "Romantic Corners",
        "Weekend Plans",
    ],
    "Friends": [
        "Group Brunch",
        "Catch Ups",
        "Shared Orders",
        "Celebrations",
        "Friend Traditions",
    ],
    "Families": [
        "Family Tables",
        "Kids Friendly",
        "Parent Moments",
        "Weekend Family Meals",
        "Generations Together",
    ],
    "Wellness": [
        "Balanced Plates",
        "Fresh Ingredients",
        "Light Options",
        "Mindful Breaks",
        "Healthy Drinks",
    ],
    "Challenges": [
        "Taste Tests",
        "Guess The Dish",
        "Menu Battles",
        "Coffee Challenges",
        "Brunch Games",
    ],
    "Guest Stories": [
        "First Time Guests",
        "Regular Stories",
        "Birthday Visits",
        "Travelers",
        "Customer Favorites",
    ],
    "Weekend Lifestyle": [
        "Saturday Brunch",
        "Sunday Brunch",
        "Lazy Mornings",
        "Weekend Plans",
        "Post Brunch Walks",
    ],
    "Discovery": [
        "New Menu Items",
        "Hidden Favorites",
        "Staff Picks",
        "Flavor Discoveries",
        "Seasonal Finds",
    ],
}

# Main content pillars.
pillars = list(subpillars)

# Content mechanics to combine with each pillar and subpillar.
mechanics = [
    "Guess",
    "Quiz",
    "POV",
    "Ranking",
    "Transformation",
    "Checklist",
    "Myth Busting",
    "Before and After",
    "Step by Step",
    "Storytime",
]


def generate_library():
    """Generate structured combinations with sequential IDs."""
    library = []
    next_id = 1

    for pillar in pillars:
        for subpillar in subpillars[pillar]:
            for mechanic in mechanics:
                library.append(
                    {
                        "id": next_id,
                        "pillar": pillar,
                        "subpillar": subpillar,
                        "mechanic": mechanic,
                    }
                )
                next_id += 1

    return library


def main():
    """Save the generated library as formatted JSON."""
    library = generate_library()
    output_path = Path("library.json")

    with output_path.open("w", encoding="utf-8") as file:
        json.dump(library, file, indent=2)

    print(f"Total generated: {len(library)}")
    print(f"Saved file: {output_path.resolve()}")


if __name__ == "__main__":
    main()
