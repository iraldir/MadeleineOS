#!/bin/bash

# Check if a name parameter was provided
if [ $# -eq 0 ]; then
    echo "Error: No name parameter provided."
    echo "Usage: $0 <character_name> [franchise_name]"
    exit 1
fi

NAME=$1
FRANCHISE="${2:-Misc}" # Default franchise to "Misc" if not provided
COLORING_SOURCE="public/images/coloring/blank.webp"
CHARACTERS_DIR="public/images/characters"
CHARACTERS_FILE="types/characters.ts"

# Create blank.webp in characters folder if it doesn't exist
if [ ! -f "$CHARACTERS_DIR/blank.webp" ]; then
    echo "Creating blank.webp in characters folder..."
    cp "$COLORING_SOURCE" "$CHARACTERS_DIR/blank.webp"
fi

# Copy blank.webp to numbered files in coloring folder
echo "Creating coloring images for $NAME..."
for i in {1..4}; do
    cp "$COLORING_SOURCE" "public/images/coloring/$NAME$i.webp"
    echo "Created public/images/coloring/$NAME$i.webp"
done

# Copy blank.webp to character file
echo "Creating character image for $NAME..."
cp "$CHARACTERS_DIR/blank.webp" "$CHARACTERS_DIR/$NAME.webp"
echo "Created $CHARACTERS_DIR/$NAME.webp"

# Add character to characters.ts file
echo "Adding $NAME to $CHARACTERS_FILE..."

# Create the character entry
ENTRY="  // $NAME
  {
    id: \"$NAME\",
    name: \"${NAME^^}\",
    imageUrl: \"/images/characters/$NAME.webp\",
    franchise: \"$FRANCHISE\",
    coloringPages: [
      \"/images/coloring/${NAME}1.webp\",
      \"/images/coloring/${NAME}2.webp\",
      \"/images/coloring/${NAME}3.webp\",
      \"/images/coloring/${NAME}4.webp\",
    ],
  },"

# Insert the new character entry before the closing bracket of the characters array
sed -i '' -e "/^\];/i\\
$ENTRY
" "$CHARACTERS_FILE"

echo "All images for $NAME have been created successfully."
echo "$NAME has been added to the characters.ts file."
