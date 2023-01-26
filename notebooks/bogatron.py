# https://blog.bogatron.net/blog/2012/02/02/visualizing-dirichlet-distributions/
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.tri as tri
from math import gamma
from scipy.special import loggamma

corners = np.array([[0, 0], [1, 0], [0.5, 0.75**0.5]])
AREA = 0.5 * 1 * 0.75**0.5
triangle = tri.Triangulation(corners[:, 0], corners[:, 1])

refiner = tri.UniformTriRefiner(triangle)
trimesh = refiner.refine_triangulation(subdiv=4)

# plt.figure(figsize=(8, 4))
# for (i, mesh) in enumerate((triangle, trimesh)):
#     plt.subplot(1, 2, i+ 1)
#     plt.triplot(mesh)
#     plt.axis('off')
#     plt.axis('equal')
    
# For each corner of the triangle, the pair of other corners
pairs = [corners[np.roll(range(3), -i)[1:]] for i in range(3)]
# The area of the triangle formed by point xy and another pair or points
tri_area = lambda xy, pair: 0.5 * np.linalg.norm(np.cross(*(pair - xy)))

def xy2bc(xy, tol=1.e-4):
    '''Converts 2D Cartesian coordinates to barycentric.'''
    coords = np.array([tri_area(xy, p) for p in pairs]) / AREA
    return np.clip(coords, tol, 1.0 - tol)

# For each corner of the triangle, the pair of other corners
pairs = [corners[np.roll(range(3), -i)[1:]] for i in range(3)]
# The area of the triangle formed by point xy and another pair or points
tri_area = lambda xy, pair: 0.5 * np.linalg.norm(np.cross(*(pair - xy)))

def xy2bc(xy, tol=1.e-4):
    '''Converts 2D Cartesian coordinates to barycentric.'''
    coords = np.array([tri_area(xy, p) for p in pairs]) / AREA
    return np.clip(coords, tol, 1.0 - tol)

class Dirichlet(object):
    def __init__(self, alpha):
        from operator import mul
        self._alpha = np.array(alpha)
        self._coef = loggamma(np.sum(alpha)) - np.add.reduce([loggamma(a) for a in alpha])
        # self._coef = np.exp(loggamma(np.sum(alpha)) - np.add.reduce([loggamma(a) for a in alpha]))
        # self._coef = np.exp(loggamma(np.sum(alpha)) - np.add.reduce(np.log([gamma(a) for a in alpha])))
        # self._coef = gamma(np.sum(self._alpha)) / \
        #                    np.multiply.reduce([gamma(a) for a in self._alpha])
    def pdf(self, x):
        '''Returns pdf value for `x`.'''
        from operator import mul
        return np.exp(self._coef + np.add.reduce([(aa-1) * np.log(xx) for (xx, aa)in zip(x, self._alpha)]))
        # return self._coef * np.multiply.reduce([xx ** (aa - 1) for (xx, aa)in zip(x, self._alpha)])
    
def draw_pdf_contours(dist, nlevels=200, subdiv=8, **kwargs):
    import math

    refiner = tri.UniformTriRefiner(triangle)
    trimesh = refiner.refine_triangulation(subdiv=subdiv)
    pvals = [dist.pdf(xy2bc(xy)) for xy in zip(trimesh.x, trimesh.y)]

    plt.tricontourf(trimesh, pvals, nlevels, cmap='jet', **kwargs)
    plt.axis('equal')
    plt.xlim(0, 1)
    plt.ylim(0, 0.75**0.5)
    plt.axis('off')

#draw_pdf_contours(Dirichlet([1, 10, 1]))

if __name__ == '__main__':
    alpha = np.array([50, 70, 50])
    a = gamma(np.sum(alpha)) / np.multiply.reduce([gamma(a) for a in alpha])
    b = np.exp(loggamma(np.sum(alpha)) - np.add.reduce([loggamma(a) for a in alpha]))
    print(a)
    print(b)
