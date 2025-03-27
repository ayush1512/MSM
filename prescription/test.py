import pygame
import pymunk
import pymunk.pygame_util
import math

# Initialize Pygame
pygame.init()

# Screen settings
WIDTH, HEIGHT = 600, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
clock = pygame.time.Clock()

# Physics settings
space = pymunk.Space()
space.gravity = (0, 900)  # Gravity in the downward direction

# Draw options
draw_options = pymunk.pygame_util.DrawOptions(screen)

# Hexagon properties
hex_radius = 200
hex_center = (WIDTH // 2, HEIGHT // 2)
hex_rotation = 0  # Rotation angle

# Ball properties
ball_radius = 20

def create_hexagon():
    """Creates a static hexagonal container."""
    global hex_body, hex_segments
    hex_body = pymunk.Body(body_type=pymunk.Body.STATIC)  # Static body
    space.add(hex_body)  # ADD THE BODY TO THE SPACE

    hex_segments = []
    for i in range(6):
        angle_a = math.radians(i * 60)
        angle_b = math.radians((i + 1) * 60)
        p1 = (math.cos(angle_a) * hex_radius, math.sin(angle_a) * hex_radius)
        p2 = (math.cos(angle_b) * hex_radius, math.sin(angle_b) * hex_radius)
        segment = pymunk.Segment(hex_body, p1, p2, 5)
        segment.elasticity = 0.9
        segment.friction = 0.5
        hex_segments.append(segment)

    space.add(*hex_segments)  # Add all segments at once

def create_ball():
    """Creates a dynamic ball inside the hexagon."""
    body = pymunk.Body(mass=1, moment=pymunk.moment_for_circle(1, 0, ball_radius))
    body.position = hex_center[0], hex_center[1] - 100  # Start inside hexagon
    shape = pymunk.Circle(body, ball_radius)
    shape.elasticity = 0.9
    shape.friction = 0.5
    space.add(body, shape)
    return body

# Create hexagon and ball
create_hexagon()
ball_body = create_ball()

running = True
while running:
    screen.fill((30, 30, 30))  # Background color
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Rotate hexagon
    hex_rotation += 2  # Rotation speed
    angle_rad = math.radians(hex_rotation)

    # Recreate rotated hexagon
    space.remove(*hex_segments)
    create_hexagon()  # Recreate hexagon with rotation

    # Step simulation
    space.step(1 / 60)

    # Draw physics objects
    space.debug_draw(draw_options)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()