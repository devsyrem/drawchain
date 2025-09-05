#!/bin/bash

# Basic image processing using ImageMagick
# Usage: ./basic_image_magick.sh input_path output_path style

INPUT_PATH="$1"
OUTPUT_PATH="$2"
STYLE="$3"

if [ ! -f "$INPUT_PATH" ]; then
    echo "Error: Input file $INPUT_PATH does not exist"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$(dirname "$OUTPUT_PATH")"

echo "Processing image with style: $STYLE"

case "$STYLE" in
    "oil_painting")
        # Oil painting effect: add texture and enhance colors
        convert "$INPUT_PATH" \
            -paint 2 \
            -modulate 110,120,100 \
            -unsharp 0x1 \
            "$OUTPUT_PATH"
        ;;
    "anime")
        # Anime effect: posterize and enhance
        convert "$INPUT_PATH" \
            -posterize 6 \
            -modulate 100,130,100 \
            -unsharp 0x2 \
            "$OUTPUT_PATH"
        ;;
    "pixel_art")
        # Pixel art effect: scale down and up
        SIZE=$(identify -format "%wx%h" "$INPUT_PATH")
        WIDTH=$(echo $SIZE | cut -d'x' -f1)
        HEIGHT=$(echo $SIZE | cut -d'x' -f2)
        SMALL_WIDTH=$((WIDTH / 8))
        SMALL_HEIGHT=$((HEIGHT / 8))
        
        convert "$INPUT_PATH" \
            -scale ${SMALL_WIDTH}x${SMALL_HEIGHT} \
            -scale ${WIDTH}x${HEIGHT} \
            -posterize 4 \
            "$OUTPUT_PATH"
        ;;
    "watercolor")
        # Watercolor effect: soft and blurred
        convert "$INPUT_PATH" \
            -blur 0x1 \
            -modulate 90,110,100 \
            -paint 1 \
            "$OUTPUT_PATH"
        ;;
    "van_gogh")
        # Van Gogh effect: heavy texture and color
        convert "$INPUT_PATH" \
            -paint 3 \
            -modulate 110,150,100 \
            -emboss 2 \
            -enhance \
            "$OUTPUT_PATH"
        ;;
    "cyberpunk")
        # Cyberpunk effect: blue tint and high contrast
        convert "$INPUT_PATH" \
            -modulate 100,120,100 \
            -fill blue -colorize 15% \
            -contrast \
            -normalize \
            "$OUTPUT_PATH"
        ;;
    *)
        # Default: slight enhancement
        convert "$INPUT_PATH" \
            -modulate 105,110,100 \
            -unsharp 0x0.5 \
            "$OUTPUT_PATH"
        ;;
esac

if [ $? -eq 0 ]; then
    echo "Image processed successfully: $OUTPUT_PATH"
else
    echo "Error processing image"
    exit 1
fi