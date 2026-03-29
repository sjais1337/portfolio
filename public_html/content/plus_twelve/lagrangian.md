# Lagrangian

The **Euler-Lagrange Equation** is 

$$
\frac{d}{dt}\frac{\partial L }{\partial \dot x} = \frac{\partial L}{\partial x} \implies m\vec{\ddot x} = \ce{-\nabla V  (3 Dimensional)}
$$

For more than one-coordinates, just write this for all coordinates. Blindly taking derivatives after writing *ALL* the energies as functions of the variables, we may take different points as initial points for potential since this differs the potential by only a constant which doesn’t affect our solution.

The **Action** is defined as

$$
S = \int_{t_1}^{t_2} L(x,\dot x, t)dt
$$

The Euler-Lagrange Equation is essentially just a statement which figures out the equation for the *stationary points* of the a*ction* for example, a ball dropped has a path of *stationary* action, not necessarily the least, or the maximum, but stationary action. For example in the figure given, the ball could have acquired any of the shown trajectories, and the E-L equation gives us the path necessary. Note however, we always fix the endpoints when dealing with these equations, with the endpoints being situated at times $t_1, t_2$ respectively. This isn’t necessarily intuitive and is a result of a mathematical expedition led by some great people.  

Now consider the case we want to find the *reaction* forces which exist due to constraints. For example in a ball sliding on a hemisphere, the radius R=r is the constraint imposed, which leads to the tangential F=ma equation. But our goal here is to find the radial F=ma equation. Notice that when we impose the constraint R = r, we no longer are varying radial components, thus the partial derivative of the Lagrangian with respect to radius is going to be 0, and we won’t be able to find it. Thus, we must not place the constraints *too soon* and instead apply the constraints after finding out the condition for stationary action with respect to the radius. Now, we must understand that Lagrangian is not a “energy method” of F=ma. Instead, it is more precise than Newton’s laws at the molecular scale. Thus, the fact that the ball gets squished into the hemisphere is also something that the Lagrangian takes account of. The explanation of this fact is Quantum Mechanical which is indeed the more precise form of classical physics, and hence diving into it is of no particular use). Thus, to find the normal force, we can initially leave out the constraints and apply them later on. We also don’t need to bother writing down $V(x_i)$ to find the constraint, since we have to take the derivative of the Lagrangian, and the $V(x_i)$ term only serves the purpose of finding the force as:

$$
-\frac{\ce{d}V(x_i)}{\ce{d}x_i} = F
$$

Now, the conservation laws (momentum conservation, angular momentum conservation) are valid in this formalism too, but of course in a more general way. If the Lagrangian does not depend on a particular $x_i$, which doesn’t imply it can’t depend on $\dot x, \ddot x$ etc, then the derivative of the Lagrangian with respect to $x_i$ remains a constant. This quantity is known as the *generalized momentum* which remains conserved in the conditions mentioned above. This is called generalized since it is valid for any $x_i$ and may result in linear, or angular or some weird other momentum conservation.

$$
p_g = \frac{\partial L }{\partial x_i}
$$

Energy is also conserved, and is slightly weird here (and it may or may not represent energy at all, if the system is not closed, and entirely determined by a Lagrangian)

$$
E = \sum_{i=1}^{N} \frac{\partial L}{\partial \dot q_i} \dot q_i - L
$$

and satisfies, 

$$
\frac{\partial L}{\partial t} = -\frac{dE}{dt}
$$

Of course, we do know that the Lagrangian and Energy terms differ only by the sign in front of potential, hence changing it just gives us our energy. 

There’s Noether’s Theorem but I am too dumb to understand it so safely skipped it. 

Now, having spoken about energy remember that in one dimension, the given formula holds true for the angular frequency, given $x_0$  as the equilibrium point,

$$
\omega = \sqrt{\frac{V^{\prime \prime} (x_0)}{m}}
$$